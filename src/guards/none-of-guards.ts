import {
  CanActivate,
  ExecutionContext,
  Injectable,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export function OneOfGuards(
  guardsRefs: Type<CanActivate>[],
): Type<CanActivate> {
  @Injectable()
  class SuperGuard implements CanActivate, OnModuleInit {
    private guards: CanActivate[];

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
      for await (const guard of this.guards) {
        const canActivate = await guard.canActivate(context);

        if (canActivate) return false;
      }

      return true;
    }
  }

  return SuperGuard;
}
