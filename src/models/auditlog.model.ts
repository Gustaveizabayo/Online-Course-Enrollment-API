import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema(
    {
        actorId: { type: String, required: true }, // User.id
        action: { type: String, required: true },
        targetType: { type: String, required: true },
        targetId: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed }

    },
    { timestamps: true }
);

export const AuditLog = model("AuditLog", AuditLogSchema)
