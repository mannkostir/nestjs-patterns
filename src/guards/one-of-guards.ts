import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * @description Returns true if one of CanActivate collection returns true
 * @example -@UseGuards(OneOfGuards(GuardA, GuardB), GuardC)
 * */

 type Options = {
  message?: string;
};

export function OneOfGuards(
  guardsRefs: Type<CanActivate>[],
  options: Options = {},
): Type<CanActivate> {
  @Injectable()
  class SuperGuard implements CanActivate, OnModuleInit {
    private guards: CanActivate[] = [];

    constructor(private readonly moduleRef: ModuleRef) {}

    async onModuleInit() {
      this.guards = await Promise.all(
        guardsRefs.map(async guardRef => {
          let guard: CanActivate;

          try {
            guard = await this.moduleRef.get(guardRef);
          } catch {
            guard = await this.moduleRef.create(guardRef);
          }
          
          return guard;
        }),
      );
    }

    async canActivate(context: ExecutionContext) {
      const exceptions: HttpException[] = []

      for await (const guard of this.guards) {
        try {
          const canActivate = await guard.canActivate(context);

          if (!canActivate) throw new ForbiddenException();

          return true;
        } catch (err) {
          exceptions.push(err);
        }
      }

      throw new ForbiddenException(options.message);
    }
  }

  return SuperGuard;
}
