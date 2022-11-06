import { createYoga } from 'graphql-yoga';
import { PayloadRequest } from '../express/types';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const graphQLHandler = (req: PayloadRequest, endpoint: string) => {
  const { payload } = req;

  payload.errorResponses = null;

  return createYoga({
    schema: payload.schema,
    graphqlEndpoint: endpoint,
  });

  // return graphqlHTTP(
  //   async (request, response, { variables }) => ({
  //     schema: payload.schema,
  //     customFormatErrorFn: payload.customFormatErrorFn,
  //     extensions: payload.extensions,
  //     context: { req, res },
  //     validationRules: payload.validationRules(variables),
  //   }),
  // );
};

export default graphQLHandler;
