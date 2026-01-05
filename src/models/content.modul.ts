import { Schema, model } from "mongoose";

const LessonContentSchema = new Schema(
    {
        courseId: { type: String, required: true }, // link to postgres course.id
        lessonNumber: { type: Number, required: true },
        title: { type: String, required: true },
        blocks: [
            {
                type: { type: String, enum: ["text", "image", "quiz"], required: true },
                data: { type: Schema.Types.Mixed, required: true}

            }
        ],
        

    },
    { timestamps: true}
);

export const LessonContentModel = model("LessonContent", LessonContentSchema);