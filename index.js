#!/usr/bin/env node

import propertiesReader from 'properties-reader';
import inquirer from 'inquirer';
import { createSpinner } from "nanospinner";
import chalk from "chalk";
import fs from 'fs';


const args = process.argv.slice(2);
const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
const credentials = propertiesReader(`${process.env.HOME}/.aws/credentials`);

const regionList = [
    'af-south-1',
    'ap-northeast-1',
    'ap-northeast-3',
    'ap-southeast-1',
    'ca-central-1',
    'eu-north-1',
    'eu-west-1',
    'eu-west-3',
    'sa-east-1',
    'us-east-2',
    'us-west-2',                     
    'ap-east-1',
    'ap-northeast-2',
    'ap-south-1',
    'ap-southeast-2',
    'eu-central-1',
    'eu-south-1',
    'eu-west-2',
    'me-south-1',
    'us-east-1',
    'us-west-1' 
]

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

async function chooseProfile(doRemove) {
    const answer = await inquirer.prompt({
        name: 'profileName',
        type: "list",
        message: "Choose AWS profile to be default:",
        choices: profileList
    })

    if(doRemove){

    } else{
        return handleAnswerChoose(answer.profileName)
    }
};

async function handleAnswerChoose(profile) {
    const spinner = createSpinner('Switching profile...').start();
    await sleep();


    const awsAccessKeyId = credentials.get(`${profile}.aws_access_key_id`);
    const awsSecretAccessKey = credentials.get(`${profile}.aws_secret_access_key`);
    credentials.set(`default.aws_access_key_id`, awsAccessKeyId);
    credentials.set(`default.aws_secret_access_key`, awsSecretAccessKey);
    if (isConfigExist) {
        const awsRegion = config.get(`${profile}.region`);
        awsRegion ? config.set(`default.region`, awsRegion) : config.set(`default.region`, '');
        await config.save(`${process.env.HOME}/.aws/config`);
        spinner.success({ text: `Default region switched to [${chalk.greenBright(awsRegion)}]` });
    }
    await credentials.save(`${process.env.HOME}/.aws/credentials`);
    spinner.success({ text: `Default profile switched to [${chalk.greenBright(profile)}]` });
};

async function addProfile() {
    const answer = await inquirer.prompt([{
        name: 'profileName',
        type: 'input',
        message: 'Write down name for a new profile: '
    },
    {
        name: 'awsAccessKeyId',
        type: 'input',
        message: 'Write down aws_access_key_id for a new profile: '
    },
    {
        name: 'awsSecretAccessKey',
        type: 'input',
        message: 'Write down aws_secret_access_key for a new profile: '
    },
    {
        name: 'awsRegion',
        type: 'list',
        message: 'Choose your default aws region for this profile: ',
        choices: regionList
    }]);
    // console.log(answer);
    addAnswerHandle(answer);
};

// async function deleteAnswerHandle(profile){

// }

async function addAnswerHandle(profile){
    const spinner = createSpinner('Adding new profile...').start();
    await sleep();

    credentials.set(`${profile.profileName}.aws_access_key_id`, profile.awsAccessKeyId);
    credentials.set(`${profile.profileName}.aws_secret_access_key`, profile.awsSecretAccessKey);
    if (isConfigExist){
        config.set(`${profile.profileName}.region`, profile.awsRegion);
        config.set(`${profile.profileName}.output`, `json`);
        await config.save(`${process.env.HOME}/.aws/config`);
    };
    await credentials.save(`${process.env.HOME}/.aws/credentials`);
    spinner.success({ text: `New profile ${chalk.cyanBright(profile.profileName)} added succesfully.` });
};

if (args.length == 0) { chooseProfile() }
else {
    switch (args[0]) {
        case 'add':
            addProfile();
    };
};