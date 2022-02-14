#!/usr/bin/env node

import propertiesReader from 'properties-reader';
import inquirer from 'inquirer';
import { createSpinner } from "nanospinner";

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
const credentials = propertiesReader(`${process.env.HOME}/.aws/credentials`);

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
    const awsaRegion = credentials.get(`${profile}.aws_region`);
    credentials.set(`default.aws_access_key_id`, awsAccessKeyId);
    credentials.set(`default.aws_secret_access_key`, awsSecretAccessKey);
    awsaRegion ? credentials.set(`default.aws_region`, awsaRegion): credentials.set(`default.aws_region`, '');
    await credentials.save(`${process.env.HOME}/.aws/credentials`);
    spinner.success({text:`Default profile switched to ${profile}`});
}

console.clear();
askProfile();

