/**
 * Forever - 环境状态检查
 * 检查Python及所有依赖包的安装状态
 */

import { execSync } from 'child_process';
import { detectPython, checkPythonPackage, getPythonPackageVersion } from './python-env';

export interface EnvironmentStatus {
  python: { installed: boolean; version?: string };
  packages: {
    chatterbox: { installed: boolean; version?: string };
    mem0: { installed: boolean; version?: string };
    torch: { installed: boolean; version?: string };
    torchaudio: { installed: boolean; version?: string };
    numpy: { installed: boolean; version?: string };
  };
}

export function checkEnvironment(): EnvironmentStatus {
  const status: EnvironmentStatus = {
    python: { installed: false },
    packages: {
      chatterbox: { installed: false },
      mem0: { installed: false },
      torch: { installed: false },
      torchaudio: { installed: false },
      numpy: { installed: false },
    },
  };

  try {
    const python = detectPython();
    status.python = { installed: true, version: execSync(`${python} --version`, { encoding: 'utf-8' }).trim() };

    for (const [key, pkg] of Object.entries({
      chatterbox: 'chatterbox_tts',
      mem0: 'mem0',
      torch: 'torch',
      torchaudio: 'torchaudio',
      numpy: 'numpy',
    })) {
      const installed = checkPythonPackage(pkg);
      (status.packages as any)[key] = {
        installed,
        version: installed ? getPythonPackageVersion(pkg) || 'unknown' : undefined,
      };
    }
  } catch {
    status.python = { installed: false };
  }

  return status;
}
