import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.flatMap((error) =>
          AppValidationPipe.formatErrors(error),
        );
        return new BadRequestException({ errors });
      },
    });
  }

  private static formatErrors(
    error: ValidationError,
    parentPath?: string,
  ): Array<{ msg: string; param: string; value?: unknown }> {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const constraints = error.constraints ? Object.values(error.constraints) : [];

    const currentLevel = constraints.map((msg) => {
      const formatted: { msg: string; param: string; value?: unknown } = {
        msg,
        param: field,
      };
      if (Object.prototype.hasOwnProperty.call(error, 'value')) {
        formatted.value = (error as any).value;
      }
      return formatted;
    });

    if (error.children && error.children.length > 0) {
      return currentLevel.concat(
        error.children.flatMap((child) => this.formatErrors(child, field)),
      );
    }

    return currentLevel;
  }
}
