import mongoose from 'mongoose';
import payload from '../../src';
import type { Options as CreateOptions } from '../../src/collections/operations/local/create';
import { Forbidden } from '../../src/errors';
import type { PayloadRequest } from '../../src/types';
import { initPayloadTest } from '../helpers/configHelpers';
import { booleanPostsSlug, booleanRestrictedSlug, relyOnRequestHeadersSlug, requestHeaders, restrictedSlug, siblingDataSlug, slug } from './config';
import type { Restricted, Post, SiblingDatum, RelyOnRequestHeader, BooleanPost, BooleanRestricted } from './payload-types';
import { firstArrayText, secondArrayText } from './shared';

// eslint-disable-next-line jest/no-focused-tests
describe('Access Control', () => {
  let post1: Post;
  let restricted: Restricted;
  let booleanAccessPost: BooleanPost;
  let booleanAccessRestricted: BooleanRestricted;

  beforeAll(async () => {
    await initPayloadTest({ __dirname });
  });

  beforeEach(async () => {
    post1 = await payload.create<Post>({
      collection: slug,
      data: { name: 'name' },
    });

    booleanAccessPost = await payload.create<BooleanPost>({
      collection: booleanPostsSlug,
      data: { name: 'name' },
    });

    restricted = await payload.create<Restricted>({
      collection: restrictedSlug,
      data: { name: 'restricted' },
    });

    booleanAccessRestricted = await payload.create<BooleanRestricted>({
      collection: booleanRestrictedSlug,
      data: { name: 'restricted' },
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await payload.mongoMemoryServer.stop();
  });

  it.todo('should properly prevent / allow public users from reading a restricted field');

  it('should be able to restrict access based upon siblingData', async () => {
    const { id } = await payload.create<SiblingDatum>({
      collection: siblingDataSlug,
      data: {
        array: [
          {
            text: firstArrayText,
            allowPublicReadability: true,
          },
          {
            text: secondArrayText,
            allowPublicReadability: false,
          },
        ],
      },
    });

    const doc = await payload.findByID<SiblingDatum>({
      id,
      collection: siblingDataSlug,
      overrideAccess: false,
    });

    expect(doc.array?.[0].text).toBe(firstArrayText);
    // Should respect PublicReadabilityAccess function and not be sent
    expect(doc.array?.[1].text).toBeUndefined();

    // Retrieve with default of overriding access
    const docOverride = await payload.findByID<SiblingDatum>({
      id,
      collection: siblingDataSlug,
    });

    expect(docOverride.array?.[0].text).toBe(firstArrayText);
    expect(docOverride.array?.[1].text).toBe(secondArrayText);
  });

  // eslint-disable-next-line jest/no-focused-tests
  describe('Collections', () => {
    // eslint-disable-next-line jest/no-focused-tests
    describe('restricted collection', () => {
      it('field without read access should not show', async () => {
        const { id } = await createDoc<Post>({ restrictedField: 'restricted' });

        const retrievedDoc = await payload.findByID({ collection: slug, id, overrideAccess: false });

        expect(retrievedDoc.restrictedField).toBeUndefined();
      });

      // eslint-disable-next-line jest/no-focused-tests
      it('field without boolean read access should not show', async () => {
        const { id } = await createDoc<BooleanPost>({ restrictedField: 'restricted' }, booleanPostsSlug);

        const retrievedDoc = await payload.findByID({ collection: booleanPostsSlug, id, overrideAccess: false });

        expect(retrievedDoc.restrictedField).toBeUndefined();
      });

      it('field without read access should not show when overrideAccess: true', async () => {
        const { id, restrictedField } = await createDoc<Post>({ restrictedField: 'restricted' });

        const retrievedDoc = await payload.findByID({ collection: slug, id, overrideAccess: true });

        expect(retrievedDoc.restrictedField).toEqual(restrictedField);
      });

      it('field without read access should not show when overrideAccess default', async () => {
        const { id, restrictedField } = await createDoc<Post>({ restrictedField: 'restricted' });

        const retrievedDoc = await payload.findByID({ collection: slug, id });

        expect(retrievedDoc.restrictedField).toEqual(restrictedField);
      });
    });
    describe('non-enumerated request properties passed to access control', () => {
      it('access control ok when passing request headers', async () => {
        const req = Object.defineProperty({}, 'headers', {
          value: requestHeaders,
          enumerable: false,
        }) as PayloadRequest;
        const name = 'name';
        const overrideAccess = false;

        const { id } = await createDoc<RelyOnRequestHeader>({ name }, relyOnRequestHeadersSlug, { req, overrideAccess });
        const docById = await payload.findByID({ collection: relyOnRequestHeadersSlug, id, req, overrideAccess });
        const { docs: docsByName } = await payload.find({
          collection: relyOnRequestHeadersSlug,
          where: {
            name: {
              equals: name,
            },
          },
          req,
          overrideAccess,
        });

        expect(docById).not.toBeUndefined();
        expect(docsByName.length).toBeGreaterThan(0);
      });

      it('access control fails when omitting request headers', async () => {
        const name = 'name';
        const overrideAccess = false;

        await expect(() => createDoc<RelyOnRequestHeader>({ name }, relyOnRequestHeadersSlug, { overrideAccess })).rejects.toThrow(Forbidden);
        const { id } = await createDoc<RelyOnRequestHeader>({ name }, relyOnRequestHeadersSlug);

        await expect(() => payload.findByID({ collection: relyOnRequestHeadersSlug, id, overrideAccess })).rejects.toThrow(Forbidden);

        await expect(() => payload.find({
          collection: relyOnRequestHeadersSlug,
          where: {
            name: {
              equals: name,
            },
          },
          overrideAccess,
        })).rejects.toThrow(Forbidden);
      });
    });
  });

  describe('Override Access', () => {
    describe('Fields', () => {
      it('should allow overrideAccess: false', async () => {
        const req = async () => payload.update<Post>({
          collection: slug,
          id: post1.id,
          data: { restrictedField: restricted.id },
          overrideAccess: false, // this should respect access control
        });

        await expect(req).rejects.toThrow(Forbidden);
      });

      it('should allow overrideAccess for boolean access config: false', async () => {
        const req = async () => payload.update<BooleanPost>({
          collection: booleanPostsSlug,
          id: booleanAccessPost.id,
          data: { restrictedField: booleanAccessRestricted.id },
          overrideAccess: false, // this should respect access control
        });

        await expect(req).rejects.toThrow(Forbidden);
      });

      it('should allow overrideAccess: true', async () => {
        const doc = await payload.update<Post>({
          collection: slug,
          id: post1.id,
          data: { restrictedField: restricted.id },
          overrideAccess: true, // this should override access control
        });

        expect(doc).toMatchObject({ id: post1.id });
      });

      it('should allow overrideAccess for boolean access config: true', async () => {
        const doc = await payload.update<BooleanPost>({
          collection: booleanPostsSlug,
          id: booleanAccessPost.id,
          data: { restrictedField: booleanAccessRestricted.id },
          overrideAccess: true, // this should override access control
        });

        expect(doc).toMatchObject({ id: booleanAccessPost.id });
      });

      it('should allow overrideAccess by default', async () => {
        const doc = await payload.update<Post>({
          collection: slug,
          id: post1.id,
          data: { restrictedField: restricted.id },
        });

        expect(doc).toMatchObject({ id: post1.id });
      });

      it('should allow overrideAccess for boolean access config by default', async () => {
        const doc = await payload.update<BooleanPost>({
          collection: booleanPostsSlug,
          id: booleanAccessPost.id,
          data: { restrictedField: booleanAccessRestricted.id },
        });

        expect(doc).toMatchObject({ id: booleanAccessPost.id });
      });
    });

    describe('Collections', () => {
      const updatedName = 'updated';

      it('should allow overrideAccess: false', async () => {
        const req = async () => payload.update({
          collection: restrictedSlug,
          id: restricted.id,
          data: { name: updatedName },
          overrideAccess: false, // this should respect access control
        });

        await expect(req).rejects.toThrow(Forbidden);
      });

      it('should allow overrideAccess for boolean access config: false', async () => {
        const req = async () => payload.update({
          collection: booleanRestrictedSlug,
          id: booleanAccessRestricted.id,
          data: { name: updatedName },
          overrideAccess: false, // this should respect access control
        });

        await expect(req).rejects.toThrow(Forbidden);
      });

      it('should allow overrideAccess: true', async () => {
        const doc = await payload.update({
          collection: restrictedSlug,
          id: restricted.id,
          data: { name: updatedName },
          overrideAccess: true, // this should override access control
        });

        expect(doc).toMatchObject({ id: restricted.id, name: updatedName });
      });

      it('should allow overrideAccess for boolean access config: true', async () => {
        const doc = await payload.update({
          collection: booleanRestrictedSlug,
          id: booleanAccessRestricted.id,
          data: { name: updatedName },
          overrideAccess: true, // this should override access control
        });

        expect(doc).toMatchObject({ id: booleanAccessRestricted.id, name: updatedName });
      });

      it('should allow overrideAccess by default', async () => {
        const doc = await payload.update({
          collection: restrictedSlug,
          id: restricted.id,
          data: { name: updatedName },
        });

        expect(doc).toMatchObject({ id: restricted.id, name: updatedName });
      });
    });
  });
});

async function createDoc<Collection>(data: Partial<Collection>, overrideSlug = slug, options?: Partial<CreateOptions<Collection>>): Promise<Collection> {
  return payload.create<Collection>({
    ...options,
    collection: overrideSlug,
    data: data ?? {},
  });
}
