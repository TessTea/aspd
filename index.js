#!/usr/bin/env node

import propertiesReader from 'properties-reader';
import inquirer from 'inquirer';
import { createSpinner } from "nanospinner";
import chalk from "chalk";
import fs from 'fs';

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
const credentials = propertiesReader(`${process.env.HOME}/.aws/credentials`);
let config;
let configList = [];
const isConfigExist = fs.existsSync(`${process.env.HOME}/.aws/config`)
const unsortedConfigList = [];
if (isConfigExist) {
    config = propertiesReader(`${process.env.HOME}/.aws/config`);
    
    config.each((key, value) => {
        unsortedConfigList.push(key.split('.')[0])
    });
    configList = [...new Set(unsortedConfigList)];
    configList.forEach(element => {
        if (element === 'default') return configList.splice(element, 1);
    });
  } else {
    console.log("DOES NOT exist:", `${process.env.HOME}/.aws/config`);
  }


const unsortedProfileList = [];
credentials.each((key, value) => {
    unsortedProfileList.push(key.split('.')[0])
});
const profileList = [...new Set(unsortedProfileList)];
profileList.forEach(element => {
    if (element === 'default') return profileList.splice(element, 1);
});

async function askProfile() {
    const answer = await inquirer.prompt({
        name: 'profileName',
        type: "list",
        message: "Choose AWS profile to be default:",
        choices: profileList
    })

    return handleAnswer(answer.profileName);
}

async function handleAnswer(profile) {
    const spinner = createSpinner('Switching profile...').start();
    await sleep();

    
    const awsAccessKeyId = credentials.get(`${profile}.aws_access_key_id`);
    const awsSecretAccessKey = credentials.get(`${profile}.aws_secret_access_key`);
    credentials.set(`default.aws_access_key_id`, awsAccessKeyId);
    credentials.set(`default.aws_secret_access_key`, awsSecretAccessKey);
    if (isConfigExist){
        const awsRegion = config.get(`${profile}.region`);
        awsRegion ? config.set(`default.region`, awsRegion): config.set(`default.region`, '');
        await config.save(`${process.env.HOME}/.aws/config`);
        spinner.success({text: `Default region switched to [${chalk.greenBright(awsRegion)}]`});
    }
    await credentials.save(`${process.env.HOME}/.aws/credentials`);
    spinner.success({text:`Default profile switched to [${chalk.greenBright(profile)}]`});
}

console.clear();
askProfile();

