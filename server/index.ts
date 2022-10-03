import { Workflow } from './workflow';
import { Service } from './service';


const initService = async (rpc_framework) => {
  let service = new Service(rpc_framework);
  await service.initDependency();
  await service.initServer();
}

const initWorkflow = async (rpc_framework) => {
  let workflow = new Workflow(rpc_framework);
  await workflow.initDependency();
  await workflow.initServer();
}

export = {
  initWorkflow: initWorkflow,
  initService: initService,
  service: Service,
  workflow: Workflow
}
