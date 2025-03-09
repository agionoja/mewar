import { BaseModel, createModelFromClass } from "~/models/base.model";
import { prop, type Ref } from "@typegoose/typegoose";

export enum CourseStatus {
  ON_GOING = "ON_GOING",
  FAIL = "FAIL",
  PASS = "PASS",
}

export class Course extends BaseModel {
  @prop({ required: true, type: () => String })
  name!: string;

  @prop({ required: true, type: () => String })
  code!: string;

  @prop({ required: true, type: () => Number })
  unit!: number;

  @prop({
    default: CourseStatus.ON_GOING,
    type: () => String,
    enum: CourseStatus,
  })
  status!: CourseStatus;

  @prop({ ref: Course, default: [] })
  prerequisites!: Ref<Course>[];

  // @prop({ required: true, ref: User, type: () => Types.ObjectId })
  // instructors!: Ref<User>[];
}
export const CourseModel = createModelFromClass(Course);
