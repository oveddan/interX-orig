import { promises as fs } from 'node:fs';

import { program } from 'commander';
import { stringify } from 'csv-stringify';

import { buildNodeSpec } from '../../lib/buildNodeSpec.js';

async function main() {
  // Logger.onVerbose.clear();

  program
    .name('exec-graph')
    .argument('<filename>', 'path to the output node-spec json export')
    .option('-c, --csv', `output in CSV mode`);

  program.parse(process.argv);
  const programOptions = program.opts();

  const outputPath = program.args[0];
  if (outputPath === undefined) {
    throw new Error('no path specified');
  }

  const nodeSpecJson = buildNodeSpec();

  const jsonOutput = JSON.stringify(nodeSpecJson, null, ' ');
  if (programOptions.csv) {
    const csvRows: string[][] = [];
    nodeSpecJson?.forEach((nodeSpec) => {
      const csvRow: string[] = [];
      csvRow.push(nodeSpec.type, nodeSpec.category);
      for (let i = 0; i < 5; i++) {
        if (i < nodeSpec.inputs.length) {
          csvRow.push(
            nodeSpec.inputs[i].name,
            nodeSpec.inputs[i].valueType,
            nodeSpec.inputs[i].defaultValue?.toString() || ''
          );
        } else {
          csvRow.push('', '', '');
        }
      }
      for (let i = 0; i < 5; i++) {
        if (i < nodeSpec.outputs.length) {
          csvRow.push(nodeSpec.outputs[i].name, nodeSpec.outputs[i].valueType);
        } else {
          csvRow.push('', '');
        }
      }
      csvRows.push(csvRow);
    });
    stringify(csvRows, async (err, csvOutput) => {
      await fs.writeFile(outputPath, csvOutput, {
        encoding: 'utf-8',
      });
    });
  } else {
    await fs.writeFile(outputPath, jsonOutput, {
      encoding: 'utf-8',
    });
  }
}

main();
