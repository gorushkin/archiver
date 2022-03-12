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

const testData = [
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

const errorTestData = [
  {
    name: 'invalid input path',
    input: 'qwe',
    output: 'sdfsadf',
    config: {
      archiveName: 'asdfsad',
      password: '123',
      level: 1,
    },
    expectedError: (input) => `no such file or directory ${input}`
  },
  // {
  //   name: 'invalid output path',
  //   input: '__fixtures__/test1/text.txt',
  //   output: 'sdfsadf',
  //   config: {
  //     archiveName: 'asdfsad',
  //     password: '123',
  //     level: 1,
  //   },
  //   expectedError: (input) => `no such file or directory ${input}`
  // },
];

describe('Packing tests', () => {
  beforeAll(async () => {
    await resetDir(getPathToTempDir());
  });

  describe.each(testData.map((item) => item))(
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
  test.each(errorTestData.map((item) => item))(
    '$name',
    async ({ name, input, output, config: { archiveName, password, level }, expectedError }) => {
      const res = Archiver.pack(input, output, { archiveName, password, level });
      await expect(res).rejects.toThrow(expectedError(input));
    }
  );
});
