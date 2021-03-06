import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Archiver from '../src/archiver';
import { resetDir, getDirContent, scanDir } from './helpers';
import unzipper from 'unzipper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDirectoryName = 'temp';

const getPathToFixtures = (...fileName) => path.join(__dirname, '..', '__fixtures__', ...fileName);

const getPathToTempDir = (...fileNames) =>
  path.join(process.cwd(), tempDirectoryName, ...fileNames);

const packTestData = [
  {
    testGroupName: 'Pack single file',
    folderName: 'test1',
    target: 'text.txt',
    expectedArchiveName: 'archive.zip',
  },
  {
    testGroupName: 'Pack directory',
    folderName: 'test2',
    target: 'directory',
    expectedArchiveName: 'archive.zip',
  },
];

const errorPackTestData = [
  {
    name: 'invalid input path',
    input: 'asdfsadf/asdfasdf/qwe',
    folderName: '',
    output: 'sdfsadf',
    config: {
      archiveName: 'asdfsad',
      password: '123',
      level: 1,
    },
    errorContext: 'asdfsadf/asdfasdf/qwe',
    expectedError: (name) => `no such file or directory ${name}`,
  },
  {
    name: 'file exists',
    folderName: 'test3',
    input: 'text.txt',
    output: '',
    config: {
      archiveName: 'archive.zip',
      password: '123',
      level: 1,
    },
    errorContext: 'archive.zip',
    expectedError: (name) => `there is file with ${name} name`,
  },
];

describe('Packing tests', () => {
  beforeAll(async () => {
    await resetDir(getPathToTempDir());
  });

  describe.each(packTestData.map((item) => item))(
    '$testGroupName',
    ({ folderName, expectedArchiveName, target }) => {
      let dirContent;
      let resultFolder;

      beforeAll(async () => {
        const targetPath = getPathToFixtures(folderName, target);
        resultFolder = getPathToTempDir(folderName);
        await fs.promises.mkdir(resultFolder);
        await Archiver.pack(targetPath, resultFolder, {
          archiveName: 'archive.zip',
          level: 1,
        });

        [dirContent] = await getDirContent(resultFolder);
      });

      test('file was packed successfuly', async () => {
        expect(dirContent).toEqual(expectedArchiveName);
      });

      test('archive structure and content are correct', async () => {
        const [archive] = await getDirContent(resultFolder);
        const directory = await unzipper.Open.file(getPathToTempDir(folderName, archive));
        const tempExtractDir = getPathToTempDir(folderName, folderName);
        await directory.extract({ path: tempExtractDir, concurrency: 5 });
        const expextedDirStucture = await scanDir(getPathToFixtures(folderName));
        const resultDirStucture = await scanDir(tempExtractDir);
        expect(JSON.stringify(resultDirStucture)).toEqual(JSON.stringify(expextedDirStucture));
      });
    }
  );
});

describe('error tests', () => {
  test.each(errorPackTestData.map((item) => item))(
    '$name',
    async ({
      name,
      folderName,
      input,
      output,
      config: { archiveName, password, level },
      expectedError,
      errorContext,
    }) => {
      const inputPath = getPathToFixtures(folderName, input);
      const outputPath = getPathToFixtures(folderName, output);
      const contextPath = getPathToFixtures(folderName, errorContext);
      const res = Archiver.pack(inputPath, outputPath, { archiveName, password, level });
      await expect(res).rejects.toThrow(expectedError(contextPath));
    }
  );
});

const unpackTestData = [
  {
    testGroupName: 'Unpack single file',
    folderName: 'test4',
    target: 'text.zip',
    expectedResult: 'expectedResult',
    directory: '',
  },
];

describe('Unpacking tests', () => {
  beforeAll(async () => {
    await resetDir(getPathToTempDir());
  });

  describe.each(unpackTestData.map((item) => item))(
    '$testGroupName',
    ({ folderName, expectedResult, target, directory }) => {
      let dirContent;
      let resultFolder;
      let expectedFolder;
      let expectedDirContent;

      beforeAll(async () => {
        const targetPath = getPathToFixtures(folderName, target);
        resultFolder = getPathToTempDir(folderName);
        expectedFolder = getPathToFixtures(folderName, expectedResult);
        await fs.promises.mkdir(resultFolder);
        await Archiver.unpack(targetPath, resultFolder, {
          directory,
          level: 1,
        });

        [dirContent] = await getDirContent(resultFolder);
        [expectedDirContent] = await getDirContent(expectedFolder);
      });

      test('file was unpacked successfuly', async () => {
        expect(dirContent).toEqual(expectedDirContent);
      });

      test('archive structure and content are correct', async () => {
        const expextedDirStucture = await scanDir(path.join(expectedFolder, expectedDirContent));
        const resultDirStucture = await scanDir(path.join(resultFolder, dirContent));
        expect(JSON.stringify(resultDirStucture)).toEqual(JSON.stringify(expextedDirStucture));
      });
    }
  );
});
