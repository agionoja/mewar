import { Types } from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import { Expose, Transform } from "class-transformer";
import type {
  AnyParamConstructor,
  IModelOptions,
} from "@typegoose/typegoose/lib/types";

type Discriminator<T> = T extends string ? T : string;

export abstract class BaseModel<
  TDiscriminator extends string | undefined = undefined,
> {
  @Expose()
  @Transform(({ obj, key }) =>
    obj[key] instanceof Types.ObjectId ? obj[key].toString() : obj[key],
  )
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
      timestamps: true,
      toJSON: {
        virtuals: true,
        getters: true,
      },
      toObject: {
        virtuals: true,
        getters: true,
      },

      ...schemaOptions,
    },

    ...props,
  });
}
