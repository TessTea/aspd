
# Amazon Switch Profile Default - simple cli for switchin between aws profiles through the [default] credential section.

  

## Description:

  

An alternative to standart aws asp utility, that switches across multiple profiles rewriting the default one.

  

## Instalation:

  

```shell

npm install -g aspd

```

  

## Usage:

  

At the first place your ~/.aws/credentials file should have the structure similar to this(aws_region field is optional):

  

```ini
[default]
aws_access_key_id = **********
aws_secret_access_key = **********
aws_region = ********
[profile_1]
aws_access_key_id = **********
aws_secret_access_key = **********
aws_region = ********
[profile_2]
aws_access_key_id = **********
aws_secret_access_key = **********
[profile_3]
aws_access_key_id = **********
aws_secret_access_key = **********
aws_region = ********
```

```shell

aspd

```

Then just choose profile that you want to use as default.

  

## !!! Reminder !!:

  

Your default profile will be rewriten with the chosen one, so don't forget to save it if you need.
