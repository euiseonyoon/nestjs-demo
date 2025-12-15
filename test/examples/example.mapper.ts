import * as fs from 'fs';
import * as path from 'path';

export class ExampleMapper {
    /**
     * JSON을 지정한 타입 T로 변환합니다.
     * axios와 동일하게 동작: JSON 파싱만 수행하고 런타임 타입 검증은 하지 않습니다.
     *
     * @param input - JSON 문자열, 객체, 또는 파일 경로 (절대경로 또는 상대경로)
     * @returns 파싱된 결과를 T 타입으로 캐스팅
     * @throws JSON 파싱 실패 또는 파일 읽기 실패 시 에러 발생
     */
    static fromRawJson<T>(input: string | unknown): T {
        try {
            // 문자열이고 파일 경로처럼 보이는 경우
            if (typeof input === 'string' && (input.endsWith('.json') || input.includes('/'))) {
                return this.fromFile<T>(input);
            }

            // 문자열이면 JSON 파싱
            if (typeof input === 'string') {
                return JSON.parse(input) as T;
            }

            // 이미 객체면 그대로 타입 캐스팅
            return input as T;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`JSON 파싱 실패: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * 파일에서 JSON을 읽어 타입 T로 변환합니다.
     *
     * @param filePath - 절대경로 또는 프로젝트 루트 기준 상대경로
     * @returns 파싱된 결과를 T 타입으로 캐스팅
     * @throws 파일 읽기 또는 JSON 파싱 실패 시 에러 발생
     */
    static fromFile<T>(filePath: string): T {
        try {
            // 절대 경로가 아니면 프로젝트 루트 기준으로 변환
            const absolutePath = path.isAbsolute(filePath)
                ? filePath
                : path.join(process.cwd(), filePath);

            // 파일 읽기
            const fileContent = fs.readFileSync(absolutePath, 'utf-8');

            // JSON 파싱
            return JSON.parse(fileContent) as T;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`JSON 파싱 실패 (${filePath}): ${error.message}`);
            }
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
            }
            throw error;
        }
    }
}
