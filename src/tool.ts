import { NodeKind } from './types'

export const SpaceCharacter = '  '

export function getRustNumericType(value: number): NodeKind {
    if (Number.isInteger(value)) {
        if (value >= 0) {
            if (value <= 255) return NodeKind.u8Literal;
            if (value <= 65535) return NodeKind.u16Literal;
            if (value <= 4294967295) return NodeKind.u32Literal;
            if (value <= 18446744073709551615) return NodeKind.u64Literal;
            // Rust's u128 can hold values up to 2^128 - 1, but JavaScript cannot represent such large integers accurately
            return NodeKind.u128Literal;
        } else {
            if (value >= -128) return NodeKind.i8Literal;
            if (value >= -32768) return NodeKind.i16Literal;
            if (value >= -2147483648) return NodeKind.i32Literal;
            if (value >= -9223372036854775808) return NodeKind.i64Literal;
            // Rust's i128 can hold values down to -(2^127), but JavaScript cannot represent such large integers accurately
            return NodeKind.i128Literal;
        }
    } else {
        if (Math.fround(value) === value) return NodeKind.f32Literal;
        return NodeKind.f64Literal;
    }
}