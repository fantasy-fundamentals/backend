import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FeeManagementDocument = FeeManagementEntity &
    Document & {
        _id?: any;
    };

@Schema({ timestamps: true })
export class FeeManagementEntity {
    _id?: any;

    @Prop()
    fixedFee: number;

    @Prop()
    percentageFee: number;

}

export const FeeManagementEntitySchema = SchemaFactory.createForClass(
    FeeManagementEntity
);
