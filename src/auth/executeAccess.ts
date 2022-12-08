import { Forbidden } from '../errors';
import { Access, AccessResult } from '../config/types';

const executeAccess = async (operation, access: Access): Promise<AccessResult> => {
  if (access !== undefined) {
    let result: AccessResult;
    if (typeof access === 'boolean') {
      result = access;
      // throw new Error(`using boolean access ${access}`);
    } else {
      result = await access(operation);
    }

    if (!result) {
      if (!operation.disableErrors) throw new Forbidden(operation.req.t);
    }

    return result;
  }

  if (operation.req.user) {
    return true;
  }

  if (!operation.disableErrors) throw new Forbidden(operation.req.t);
  return false;
};

export default executeAccess;
