import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Strict rules: ловят баги типа [] || fallback
    rules: {
      // Предупреждает об использовании массивов/объектов в boolean контексте
      "@typescript-eslint/strict-boolean-expressions": "off", // слишком шумный для постепенного внедрения
      // Запрещает пустые интерфейсы
      "@typescript-eslint/no-empty-interface": "warn",
      // Предупреждает о неиспользуемых переменных (кроме _)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Проверяет что array methods возвращают значение
      "array-callback-return": "error",
      // Запрещает использование == вместо ===
      "eqeqeq": ["error", "always"],
      // Запрещает fallthrough в switch
      "no-fallthrough": "error",
      // Предупреждает о console.log (кроме warn/error)
      "no-console": ["warn", { allow: ["warn", "error", "log"] }],
      // Проверяет что условия не всегда true/false
      "no-constant-condition": "warn",
      // Проверяет duplicate keys в объектах
      "no-dupe-keys": "error",
      // Проверяет unreachable code
      "no-unreachable": "error",
    },
  },
]);

export default eslintConfig;
