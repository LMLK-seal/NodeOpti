// This is our lightweight, fake AWS SDK for local development.

console.log('--- MOCK AWS-SDK LOADED ---');

class MockS3 {
  getObject(params, callback) {
    console.log('[MOCK S3] getObject called with:', params);
    // Simulate finding a file
    callback(null, { Body: 'mock file content' });
  }
  
  putObject(params, callback) {
    console.log('[MOCK S3] putObject called with:', params);
    // Simulate success
    callback(null, { ETag: '"mock-etag-12345"' });
  }
}

module.exports = {
  S3: MockS3,
  config: {
    update: (config) => {
      console.log('[MOCK AWS] config.update called with:', config);
    },
  },
};