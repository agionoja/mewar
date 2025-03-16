import {
  getDiscriminatorModelForClass,
  getModelForClass,
  type ReturnModelType,
} from "@typegoose/typegoose";
import type {
  AnyParamConstructor,
  IModelOptions,
} from "@typegoose/typegoose/lib/types";

type Discriminator<T> = T extends string ? T : string;

const defaultSchemaOptions: IModelOptions["schemaOptions"] = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (_, ret) => {
      ret._id = ret._id.toString();
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    getters: true,
    transform: (_, ret) => {
      ret._id = ret._id.toString();
      return ret;
    },
  },
};

export abstract class BaseModel<
  TDiscriminator extends string | undefined = undefined,
> {
  public _id!: string;

  public id?: string;

  public createdAt!: Date;

  public updatedAt!: Date;

  public __t?: Discriminator<TDiscriminator>;
}

export function createModelFromClass<TClass extends BaseModel>(
  cl: AnyParamConstructor<TClass>,
  { schemaOptions, ...props }: IModelOptions = {},
) {
  return getModelForClass(cl, {
    schemaOptions: {
      ...defaultSchemaOptions,
      ...schemaOptions, // Allow custom overrides
    },
    ...props,
  });
}

export function createDiscriminatorModelFromClass<
  TBase extends BaseModel,
  TClass extends TBase,
>(
  baseModel: ReturnModelType<AnyParamConstructor<TBase>>,
  cl: AnyParamConstructor<TClass>,
  { schemaOptions, ...props }: IModelOptions = {},
) {
  return getDiscriminatorModelForClass(baseModel, cl, {
    schemaOptions: {
      ...defaultSchemaOptions,
      ...schemaOptions,
    },
    ...props,
  });
}
