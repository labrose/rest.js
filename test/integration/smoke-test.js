const nock = require('nock')
const getUserAgent = require('universal-user-agent')

const Octokit = require('../../')

require('../mocha-node-setup')

describe('smoke', () => {
  it('called as function', () => {
    Octokit()
  })

  it('host & pathPrefix options', () => {
    nock('http://myhost.com')
      .get('/my/api/orgs/myorg')
      .reply(200, {})

    const octokit = new Octokit({
      baseUrl: 'http://myhost.com/my/api'
    })

    return octokit.orgs.get({ org: 'myorg' })
  })

  it('response.status & response.headers', () => {
    nock('http://myhost.com')
      .get('/my/api/orgs/myorg')
      .reply(200, {}, { 'x-foo': 'bar' })

    const octokit = new Octokit({
      baseUrl: 'http://myhost.com/my/api'
    })

    return octokit.orgs.get({ org: 'myorg' })

      .then(response => {
        expect(response.headers['x-foo']).to.equal('bar')
        expect(response.status).to.equal(200)
      })
  })

  it('custom user agent header as client option', () => {
    nock('https://smoke-test.com', {
      reqheaders: {
        'user-agent': `blah octokit.js/0.0.0-semantically-released ${getUserAgent()}`
      }
    })
      .get('/orgs/octokit')
      .reply(200, {})

    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com',
      headers: {
        'User-Agent': 'blah'
      }
    })

    return octokit.orgs.get({
      org: 'octokit'
    })
  })

  it('custom user agent header as request option', () => {
    nock('https://smoke-test.com', {
      reqheaders: {
        'user-agent': `blah`
      }
    })
      .get('/orgs/octokit')
      .reply(200, {})

    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com'
    })

    return octokit.orgs.get({
      org: 'octokit',
      headers: {
        'User-Agent': 'blah'
      }
    })
  })

  it('custom accept header', () => {
    nock('https://smoke-test.com', {
      reqheaders: {
        'accept': 'foo'
      }
    })
      .get('/orgs/octokit')
      .reply(200, {})
      .persist()

    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com'
    })

    return Promise.all([
      octokit.orgs.get({
        org: 'octokit',
        headers: {
          accept: 'foo'
        }
      }),
      octokit.orgs.get({
        org: 'octokit',
        headers: {
          Accept: 'foo'
        }
      })
    ])
  })

  it('.request("GET /")', () => {
    nock('https://smoke-test.com', {
      reqheaders: {
        'accept': 'application/vnd.github.v3+json'
      }
    })
      .get('/')
      .reply(200, {})

    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com'
    })
    return octokit.request('GET /')
  })

  it('.request.endpoint("GET /")', () => {
    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com'
    })

    const requestOptions = octokit.request.endpoint('GET /')
    expect(requestOptions).to.deep.equal({
      method: 'GET',
      url: 'https://smoke-test.com/',
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': `octokit.js/0.0.0-semantically-released ${getUserAgent()}`
      },
      request: {}
    })
  })

  it('global defaults', () => {
    const github1 = new Octokit()
    const github2 = new Octokit()

    expect(github1.request.endpoint.DEFAULTS).to.deep.equal(github2.request.endpoint.DEFAULTS)
  })

  it('registerEndpoints', () => {
    nock('https://smoke-test.com')
      .get('/baz')
      .reply(200, {})

    const octokit = new Octokit({
      baseUrl: 'https://smoke-test.com'
    })
    expect(octokit.registerEndpoints).to.be.a('function')

    octokit.registerEndpoints({
      foo: {
        bar: {
          method: 'GET',
          url: '/baz'
        }
      }
    })

    return octokit.foo.bar()
  })
})
