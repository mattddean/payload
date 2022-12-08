/* tslint:disable */
/**
 * This file was automatically generated by Payload CMS.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  email?: string;
  resetPasswordToken?: string;
  resetPasswordExpiration?: string;
  loginAttempts?: number;
  lockUntil?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "posts".
 */
export interface Post {
  id: string;
  restrictedField?: string;
  group: {
    restrictedGroupText?: string;
  };
  restrictedRowText?: string;
  restrictedCollapsibleText?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "boolean-posts".
 */
export interface BooleanPost {
  id: string;
  restrictedField?: string;
  group: {
    restrictedGroupText?: string;
  };
  restrictedRowText?: string;
  restrictedCollapsibleText?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "restricted".
 */
export interface Restricted {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "boolean-restricted".
 */
export interface BooleanRestricted {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "read-only-collection".
 */
export interface ReadOnlyCollection {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "boolean-read-only-collection".
 */
export interface BooleanReadOnlyCollection {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "restricted-versions".
 */
export interface RestrictedVersion {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "boolean-restricted-versions".
 */
export interface BooleanRestrictedVersion {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "sibling-data".
 */
export interface SiblingDatum {
  id: string;
  array: {
    allowPublicReadability?: boolean;
    text?: string;
    id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "rely-on-request-headers".
 */
export interface RelyOnRequestHeader {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
