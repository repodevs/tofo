import express = require('express');
import request = require('supertest');
import bodyParser = require('body-parser');
import { Like } from 'typeorm';
import { FindOptionBuilder } from '../../../src/find-option-builder';

describe('Test Express integration', () => {
  let server;

  beforeAll(done => {
    let app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/get', (req, res) => {
      const queryBuilder = new FindOptionBuilder(req.query);
      const built = queryBuilder.build();
      res.send(built);
    });
    app.post('/post_urlquery', (req, res) => {
      const queryBuilder = new FindOptionBuilder(req.query);
      const built = queryBuilder.build();
      res.send(built);
    });
    app.post('/post_body', (req, res) => {
      const queryBuilder = new FindOptionBuilder(req.body);
      const built = queryBuilder.build();
      res.send(built);
    });
    server = app.listen(4000, () => {
      done();
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should return an appropiate query for embeded entities', done => {
    request(server)
      .get(
        '/get?name.first=rjlopezdev&name.last=justkey&user.email__contains=@gmail.com&pagination=false'
      )
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toEqual({
          where: {
            name: {
              first: 'rjlopezdev',
              last: 'justkey'
            },
            user: {
              email: Like('%@gmail.com%')
            }
          }
        });
        done();
      });
  });

  it('should return an appropiate query built for GET /get?...', done => {
    request(server)
      .get(
        '/get?name=rjlopezdev&email__contains=@gmail.com&join=posts,comments'
      )
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toEqual({
          where: {
            name: 'rjlopezdev',
            email: Like('%@gmail.com%')
          },
          relations: ['posts', 'comments'],
          skip: 0,
          take: 25
        });
        done();
      });
  });

  it('should return an appropiate query built with order filter for GET /get?...', done => {
    request(server)
      .get('/get?name=justkey&order=^age,-salary')
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toEqual({
          where: {
            name: 'justkey'
          },
          order: {
            age: 'ASC',
            salary: 'DESC'
          },
          skip: 0,
          take: 25
        });
        done();
      });
  });

  it('should return an appropiate query built for POST /post_urlquery?...', done => {
    request(server)
      .post('/post_urlquery?name=rjlopezdev&email__contains=@gmail.com')
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toEqual({
          where: {
            name: 'rjlopezdev',
            email: Like('%@gmail.com%')
          },
          skip: 0,
          take: 25
        });
        done();
      });
  });

  it('should return an appropiate query built for POST /post_body, body: {...}', done => {
    request(server)
      .post('/post_body')
      .send({
        name: 'rjlopezdev',
        email__contains: '@gmail.com'
      })
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text)).toEqual({
          where: {
            name: 'rjlopezdev',
            email: Like('%@gmail.com%')
          },
          skip: 0,
          take: 25
        });
        done();
      });
  });
});
