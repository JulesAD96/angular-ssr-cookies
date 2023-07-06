import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import { AppServerModule } from './src/main.server';
const users = [
  {
      uid: '1',
      username: 'john',
      password: 'abc123',
      mySecret: 'I let my cat eat from my plate.',
  },
  {
      uid: '2',
      username: 'kate',
      password: '123abc',
      mySecret: 'I let my dog sleep in my bed.',
  },
];
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
    const server = express();

    server.use(compression());
    server.use(cors());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cookieParser());
    server.disable("etag")

    server.post('/auth/signIn', (req, res) => {
      const requestedUser = users.find((user) => {
          return user.username === req.body.username && user.password === req.body.password;
      });
      if (requestedUser) {
          res.cookie('authentication', requestedUser.uid, {
              maxAge: 2 * 60 * 60 * 60,
              httpOnly: true,
          });
          res.status(200).send({ status: 'authenticated' });
      } else {
          res.status(401).send({ status: 'bad credentials' });
      }
  });

  server.get('/auth/isLogged', (req, res) => {
      res.status(200).send({ authenticated: !!req.cookies.authentication });
  });
  server.get('/auth/signOut', (req, res) => {
      res.cookie('authentication', '', {
          maxAge: -1,
          httpOnly: true,
      });
      res.status(200).send({ status: 'signed out' });
  });
  server.get('/secretData', (req, res) => {
      const uid = req.cookies.authentication;
      res.status(200).send({ secret: users.find((user) => user.uid === uid)?.mySecret });
  });

    const distFolder = join(process.cwd(), 'dist/encrypted-rsa-cookie-nodejs/browser');
    const indexHtml = existsSync(join(distFolder, 'index.original.html'))
        ? 'index.original.html'
        : 'index';

    // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
    server.engine(
        'html',
        ngExpressEngine({
            bootstrap: AppServerModule,
        })
    );

    server.set('view engine', 'html');
    server.set('views', distFolder);

    // Example Express Rest API endpoints
    // server.get('/api/**', (req, res) => { });
    // Serve static files from /browser
    server.get(
        '*.*',
        express.static(distFolder, {
            maxAge: '1y',
        })
    );

    // All regular routes use the Universal engine
    server.get('*', (req, res) => {
        res.render(indexHtml, {
            req,
            providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
        });
    });



    return server;
}

function run(): void {
    const port = process.env['PORT'] || 4000;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
    run();
}

export * from './src/main.server';
