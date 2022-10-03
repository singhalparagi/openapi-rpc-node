import _ from 'lodash';
import fs from 'fs';
import Error from '../error';
let ECSMetadata = null;
import Logger from '../logging/standard_logger';
import LOG_CONSTANTS from '../logging/log_constants';
import LOG_TYPE from '../logging/log_type';
import { ConfigUtils } from "../common/config_utils"

export const LoggingUtils = {
    getTaskId: () => {
        let taskArn = getECSMetaData().TaskARN;
        return taskArn && _.isString(taskArn) && taskArn.split('/')[1] ? taskArn.split('/')[1] : 'unknown';
    },
    getContainerId: () => {
        let containerID = getECSMetaData().ContainerID;
        return containerID && _.isString(containerID) ? containerID.substr(0, 12) : 'unknown';
    },
    getContainerIp : () => {
        return getECSMetaData().HostPrivateIPv4Address;
    },
    getBuildVersion: () => {
        return getECSMetaData().TaskDefinitionRevision;
    },
    getContainerPort: () => {
        let portMappings = getECSMetaData().PortMappings;
        if (portMappings && _.isArray(portMappings)) {
            let mapping = portMappings[0];
            return mapping && mapping.HostPort ? mapping.HostPort : 'unknown';
        }
    },
    getServicePort: () => {
        let portMappings = getECSMetaData().PortMappings;
        if (portMappings && _.isArray(portMappings)) {
            let mapping = portMappings[0];
            return mapping && mapping.ContainerPort ? mapping.ContainerPort : 'unknown';
        }
    }
}

  /**
 * Example ECS Metadata Object
 * {
	"Cluster": "uc-prod-cluster-new-relic",
	"ContainerInstanceARN": "arn:aws:ecs:ap-southeast-1:642435225585:container-instance/3d74b82f-b48e-4585-b4cc-a3934647f3e4",
	"TaskARN": "arn:aws:ecs:ap-southeast-1:642435225585:task/2c5bf969-55d4-4e2e-b32c-8a1572fe41a0",
	"TaskDefinitionFamily": "service-market-production",
	"TaskDefinitionRevision": "2031",
	"ContainerID": "2eefeac9d73a3c5f33ccec23aa05e2cff90b24606d85a862d54e6314b3e182b0",
	"ContainerName": "service-market-production",
	"DockerContainerName": "/ecs-service-market-production-2031-service-market-production-909fefe798adadbf8f01",
	"ImageID": "sha256:b746661315b7625bd09cfd5eb2ae0918359ab1842fbb40cd5d2f9ed135ffd8ba",
	"ImageName": "sample-image",
	"PortMappings": [
		{
			"ContainerPort": 9000,
			"HostPort": 1026,
			"BindIp": "0.0.0.0",
			"Protocol": "tcp"
		}
	],
	"Networks": [
		{
			"NetworkMode": "bridge",
			"IPv4Addresses": [
				"172.17.0.4"
			]
		}
	],
	"MetadataFileStatus": "READY",
	"AvailabilityZone": "ap-southeast-1a",
	"HostPrivateIPv4Address": "172.32.13.80"
   }
 * @return <ECSMetadata>
 */
const getECSMetaData = () => {
    if (!ECSMetadata) {
        if (process.env.ECS_CONTAINER_METADATA_FILE && fs.existsSync(process.env.ECS_CONTAINER_METADATA_FILE)) {
        try {
            ECSMetadata = ConfigUtils.readJsonFile(process.env.ECS_CONTAINER_METADATA_FILE);
        } catch (err) {
            let logData = {};
            logData[LOG_CONSTANTS.SYSTEM_LOGS.LOG_TYPE] = LOG_TYPE.RPC_SYSTEM;
            logData[LOG_CONSTANTS.SERVICE_LEVEL_PARAMS.KEY_1] = 'ecs_metadata_status';
            logData[LOG_CONSTANTS.SERVICE_LEVEL_PARAMS.KEY_1_VALUE] = "failed";
            logData[LOG_CONSTANTS.SYSTEM_LOGS.ERROR_TYPE] = Error.RPC_FILE_LOAD_ERROR;
            logData[LOG_CONSTANTS.STRINGIFY_OBJECTS.ERROR_MESSAGE] = "Failed to fetch and load ECS Metadata. "
            + (err ? (err.message || err.err_message) : 'NA');
            logData[LOG_CONSTANTS.STRINGIFY_OBJECTS.ERROR_STACK] = err ? (err.stack || err.err_stack) : "NA";
            logData[LOG_CONSTANTS.STRINGIFY_OBJECTS.ERROR] = err;
            Logger.error(logData);
        }
        } else {
            ECSMetadata = {};
        }
    }
    return ECSMetadata;
}
