/**
 * Forever - Python环境检测
 * 检测Python解释器及已安装的包
 */

import { execSync } from 'child_process';

let pythonPath: string | null = null;

export function detectPython(): string {
  if (pythonPath) return pythonPath;

  const candidates = ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf-8' }).trim();
      if (version.includes('Python')) {
        pythonPath = cmd;
        console.log(`[PythonBridge] 检测到Python: ${version}`);
        return pythonPath;
      }
    } catch {
      continue;
    }
  }

  throw new Error('未检测到Python环境，请安装Python 3.8+');
}

export function checkPythonPackage(packageName: string): boolean {
  const python = detectPython();
  try {
    execSync(`${python} -c "import ${packageName}"`, { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

export function getPythonPackageVersion(packageName: string): string | null {
  const python = detectPython();
  try {
    const version = execSync(
      `${python} -c "import ${packageName}; print(${packageName}.__version__)"`,
      { encoding: 'utf-8' }
    ).trim();
    return version;
  } catch {
    return null;
  }
}
