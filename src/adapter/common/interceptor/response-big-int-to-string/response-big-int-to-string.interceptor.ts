import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseBigIntToStringInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map((data) => this.serialize(data)));
    }

    private serialize(obj: unknown): unknown {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'bigint') return obj.toString();

        if (Array.isArray(obj)) return obj.map((item) => this.serialize(item));

        if (typeof obj === 'object') {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.serialize(value);
            }
            return result;
        }

        return obj;
    }
}
