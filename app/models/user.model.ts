import {
  type DocumentType,
  getDiscriminatorModelForClass,
  Pre,
  prop,
  type Ref,
  type ReturnModelType,
} from "@typegoose/typegoose";
import { BaseModel, createModelFromClass } from "~/models/base.model";
import { Course } from "~/models/course.model";
import scrypt from "~/utils/scrypt";
import type { ValidatorProps } from "mongoose";
import { NotFoundException } from "~/utils/exception";

// Password Validation Utilities
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~";
const escapedSpecialChars = SPECIAL_CHARS.replace(
  /[-[\]{}()*+?.,\\^$|#\s]/g,
  "\\$&",
);
const SPECIAL_CHARS_REGEX = new RegExp(`[${escapedSpecialChars}]`);

/**
 * Password requirements:
 * - 8-50 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const PASSWORD_REGEX = new RegExp(
  `^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[${escapedSpecialChars}])[A-Za-z\\d${escapedSpecialChars}]{8,50}$`,
);

// Enums
export enum Role {
  STUDENT = "Student",
  ADMIN = "Admin",
}

export enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
}

// Base User Class
@Pre<User>("save", async function (this: DocumentType<User>) {
  await Promise.all([
    this.hashPasswordIfModified(),
    this.trackEmailChanges(),
    this.trackPasswordChanges(),
  ]);
})
export class User<
  TDiscriminator extends string | undefined = undefined,
> extends BaseModel<TDiscriminator> {
  @prop({ required: true, type: String, index: true })
  public firstname!: string;

  @prop({ required: true, type: String, index: true })
  public lastname!: string;

  @prop({ required: true, type: String, index: true, unique: true })
  public email!: string;

  @prop({ type: String })
  public previousEmail?: string;

  @prop({ type: Date })
  public emailChangedAt?: Date;

  @prop({ required: true, type: String, index: true, unique: true })
  public phone!: string;

  @prop({ enum: Role, type: String, default: Role.STUDENT })
  public role: Role = Role.STUDENT;

  @prop({ type: Boolean, default: true })
  public isActive: boolean = true;

  @prop({
    required: true,
    trim: true,
    select: false,
    type: String,
    validate: {
      validator: (value: string) => PASSWORD_REGEX.test(value),
      message: getPasswordValidationMessage,
    },
  })
  public password!: string;

  @prop({
    required: true,
    type: String,
    validate: {
      validator: function (this: DocumentType<User>, value: string) {
        return this.password === value;
      },
      message: "Passwords do not match",
    },
  })
  public passwordConfirm?: string;

  @prop({ type: String })
  public passwordResetToken?: string;

  @prop({ type: Date })
  public passwordResetTokenExpires?: Date;

  @prop({ type: Date })
  public passwordChangedAt?: Date;

  // Instance Methods
  /**
   * Hashes the password if it’s new or modified.
   */
  private async hashPasswordIfModified(this: DocumentType<User>) {
    if (this.isNew || this.isModified("password")) {
      this.password = await scrypt.hash(this.password);
      this.passwordConfirm = undefined;
    }
  }

  /**
   * Tracks email changes by storing the previous email and timestamp.
   */
  private async trackEmailChanges(this: DocumentType<User>) {
    if (!this.isNew && this.isModified("email")) {
      const user = await (
        this.constructor as ReturnModelType<typeof User>
      ).getUserFromDb(this._id);
      if (!user) throw new NotFoundException<User>("User not found", "email");
      this.previousEmail = user.email;
      this.emailChangedAt = new Date(Date.now() - 5000);
    }
  }

  /**
   * Tracks password changes by setting the changed timestamp.
   */
  private async trackPasswordChanges(this: DocumentType<User>) {
    if (!this.isNew && this.isModified("password")) {
      this.passwordChangedAt = new Date(Date.now() - 5000);
    }
  }

  /**
   * Checks if the password was changed after a JWT token was issued.
   * @param jwtIat JWT issued-at timestamp (seconds since Unix epoch)
   * @returns True if password changed after token issuance
   */
  public passwordChangedAfterJwt(jwtIat?: number): boolean {
    if (!this.passwordChangedAt) return false;
    if (!jwtIat) return true;
    return this.passwordChangedAt.getTime() > jwtIat * 1000;
  }

  /**
   * Checks if the email was changed after a JWT token was issued.
   * @param jwtIat JWT issued-at timestamp (seconds since Unix epoch)
   * @returns True if email changed after token issuance
   */
  public emailChangedAfterJwt(jwtIat?: number): boolean {
    if (!this.emailChangedAt) return false;
    if (!jwtIat) return true;
    return this.emailChangedAt.getTime() > jwtIat * 1000;
  }

  /**
   * Fetches a user by ID from the database.
   * @param id User ID
   * @returns User document with email field only
   */
  public static async getUserFromDb(
    this: ReturnModelType<typeof User>,
    id: string,
  ) {
    return this.findById(id, { email: 1 }).lean().exec();
  }
}

// Student Subclass
export class Student extends User<Role.STUDENT> {
  @prop({ required: true, type: () => [Course], ref: () => Course })
  public courses!: Ref<Course>[];

  @prop({ default: 0, type: Number })
  public gpa: number = 0;

  @prop({ default: 0, type: Number })
  public cgpa: number = 0;

  @prop({ type: String, enum: Role, default: Role.STUDENT })
  declare role: Role.STUDENT;
}

// Admin Subclass
export class Admin extends User<Role.ADMIN> {
  @prop({ type: String, enum: Role, default: Role.ADMIN })
  declare role: Role.ADMIN;
}

// Model Exports
export const UserModel = createModelFromClass(User);
export const StudentModel = getDiscriminatorModelForClass(UserModel, Student);
export const AdminModel = getDiscriminatorModelForClass(UserModel, Admin);

// Validation Helpers
function getPasswordValidationMessage({ value }: ValidatorProps): string {
  if (!value || typeof value !== "string") return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters long";
  if (value.length > 50) return "Password must not exceed 50 characters";
  if (!/[A-Z]/.test(value))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(value))
    return "Password must contain at least one lowercase letter";
  if (!/\d/.test(value)) return "Password must contain at least one number";
  if (!SPECIAL_CHARS_REGEX.test(value)) {
    return `Password must contain at least one special character (${SPECIAL_CHARS})`;
  }
  return "Invalid password";
}
