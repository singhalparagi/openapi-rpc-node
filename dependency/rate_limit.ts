import _ from 'lodash';
import { Microservice } from './microservice';
import { ExternalService } from './external_service';
import ScriptConstants from '../scripts/common/constants';
import LOG_TYPE from '../logging/log_type';
import Error from '../error';
import MonitoringConstants from '../monitoring/monitoring_constants';

const RATE_LIMIT_POLICY_SYNC_TIME_SECONDS = 60;


const getRateLimitPolicy = async (RPCFramework) => {
  const PlatformConfigServiceClient = RPCFramework.getSingleton()[ScriptConstants.PLATFORM_CONFIG_SERVICE];
  const RPC_CONFIG = RPCFramework.getSingleton().Config;
  const response = await PlatformConfigServiceClient.getRateLimit({"serviceType": "microservice", "serviceId": RPC_CONFIG.SERVICE_ID});
  return _.get(response, 'success.data');
};

export const RateLimit = {
  initRateLimit: async (params, RPCFramework) => {
    const rateLimitServiceParams = {
      "id": ScriptConstants.PLATFORM_CONFIG_SERVICE,
      "version": 0
    };
    const prometheusServiceParams = {
      "id": MonitoringConstants.PROMETHEUS_SERVICE_ID,
      "options": {
        "CIRCUIT_BREAKER_OPTIONS": {
          "ENABLE": true,
          "TIMEOUT": 10000,
          "CIRCUIT_BREAKER_FORCE_CLOSED": true
        }
      },
      "version": 0
    };
    if (!RPCFramework.getSingleton()[ScriptConstants.PLATFORM_CONFIG_SERVICE]) {
      // Initialize platform-config-service client if dependency is not
      // already initialized via dependency.config.js
      Microservice.initMicroserviceClient(rateLimitServiceParams, RPCFramework);
    }
    ExternalService.initExternalServiceClient(prometheusServiceParams, RPCFramework);
    const rateLimitPolicy = await getRateLimitPolicy(RPCFramework);
    if (!rateLimitPolicy) {
      throw new Error.RPCError({
        err_type: Error.DEPENDENCY_INITIALIZATION_ERROR,
        err_message: "RateLimitPolicy does not exist",
        log_type: LOG_TYPE.RPC_RATE_LIMIT
      });
    }
  
    if (_.get(rateLimitPolicy, 'isEnabled')) RPCFramework.addToSingleton('RateLimitPolicy', rateLimitPolicy);
    setInterval(async () => {
      const rateLimitPolicy = await getRateLimitPolicy(RPCFramework);
      if (_.get(rateLimitPolicy, 'isEnabled')) RPCFramework.addToSingleton('RateLimitPolicy', rateLimitPolicy);
      else RPCFramework.addToSingleton('RateLimitPolicy', undefined);
    }, RATE_LIMIT_POLICY_SYNC_TIME_SECONDS * 1000);
  }
}