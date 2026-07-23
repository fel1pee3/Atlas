import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * Valida o corpo/params com um schema Zod (schema-on-write na borda HTTP).
 * ZodError é traduzido para RFC 7807 pelo AllExceptionsFilter.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    return this.schema.parse(value);
  }
}
