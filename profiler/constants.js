const rpcConstants = require('../constants');

let constants = {
  STRATEGY: {
    ON_DEMAND: 'on-demand',
    CONTINUOUS: 'continuous'
  },
  TYPE: {
    MEMORY: 'memory',
    CPU: 'cpu'
  },
  EXTENSION: {
    MEMORY: '.heapsnapshot',
    CPU: '.pb.gz'
  },
  S3_PROFILE_BUCKET: rpcConstants.PROFILER.S3_PROFILE_BUCKET,
  AWS_REGION: 'ap-southeast-1',
  DEFAULT_CPU_PROFILE_TIME: 300000,
  S3_PROFILE_BUCKET_URL: rpcConstants.PROFILER.S3_PROFILE_BUCKET_URL,
  S3_UPLOAD_FAILED_ERROR: 's3_upload_failed'
};

module.exports = constants;