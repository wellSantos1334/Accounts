const express = require('express')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')

operations()

function operations() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que você quer fazer?',
                choices: [
                    'Criar Conta',
                    'Consultar Saldo',
                    'Depositar',
                    'Sacar',
                    'Transferir',
                    'Solicitar Empréstimo',
                    'Sair'
                ],
            }]).then((answer) => {
                const action = answer['action']

                if (action === 'Criar Conta') {
                    createAccount()
                } else if (action === 'Consultar Saldo') {
                    getAccountBalance()
                } else if (action === 'Depositar') {
                    depositAccount()
                } else if (action === 'Sacar') {
                    withdrawAccountBalance()
                } else if (action === 'Transferir') {
                    transferBalance()
                } else if (action === 'Solicitar Empréstimo') {
                    requestLoan()
                } else if (action === 'Sair') {
                    console.log(chalk.bgBlue.black('Obrigado por utilizar o Accounts!'))
                    process.exit()
                }
            }).catch((err) => {
                console.log('Erro: ' + err)
            })
}

// Create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Escolha uma das opções abaixo:'))
    buildAccount()
}
function buildAccount() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Digite o nome para sua conta:',
            },
        ]).then((answer) => {
            const accountName = answer['accountName']

            console.info(accountName)

            // Check if 'accounts' exist
            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            // Check if account informed exist
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(
                    chalk.bgRed.black('Já existe um nome com essa conta, por favor escolha outro!')
                )
                buildAccount()
                return
            } else {
                fs.writeFileSync(`accounts/${accountName}.json`, '{"balance":0, "loan":0}', function (err) {
                    console.log('Erro ao criar: ' + err)
                })

                console.log(chalk.green('Parabéns, conta criada com sucesso!'))
                operations()
            }


        }).catch((err) => {
            console.log('Erro: ' + err)
        })
}

// Add an amount to some user account
function depositAccount() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            }
        ]).then((answer) => {
            const accountName = answer['accountName']

            // check if account exists
            if (!checkAccount(accountName)) {
                return depositAccount()
            } else {
                inquirer
                    .prompt([
                        {
                            name: 'amount',
                            message: 'Informa o valor do depósito:'
                        },
                    ]).then((answer) => {
                        const amount = answer['amount']
                        // add an amount
                        addAmount(accountName, amount)
                        operations()

                    }).catch((err) => {
                        console.log('Erro: ' + err)
                    })
            }
        }).catch((err) => {
            console.log("Erro: " + err)
        })
}
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe!'))
        return false
    }

    return true
}
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return depositAccount()
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
}

// show account balance
function getAccountBalance() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            },
        ]).then((answer) => {
            const accountName = answer['accountName']
            if (!checkAccount(accountName)) {
                return getAccountBalance()
            } else {
                const accountData = getAccount(accountName)
                console.log(chalk.bgBlue.black('Seu saldo atual é de:', accountData.balance, 'reais'))
                operations()
            }
        }).catch((err) => {
            console.log('Erro: ' + err)
        })
}

// withdraw an amount from user account
function withdrawAccountBalance() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            },
        ]).then((answer) => {
            const accountName = answer['accountName']
            if (!checkAccount(accountName)) {
                return withdrawAccountBalance()
            } else {
                const accountData = getAccount(accountName)
                const accountBalance = parseFloat(accountData.balance)
                if (accountBalance == 0) {
                    console.log(chalk.bgBlue.black('Você não possui nenhum valor disponível!'))
                    withdrawAccountBalance()
                } else {
                    inquirer
                        .prompt([
                            {
                                name: 'withdrawValue',
                                message: 'Informe o valor que deseja sacar'
                            }
                        ]).then((answer) => {
                            const withdrawValue = parseFloat(answer['withdrawValue'])

                            if (withdrawValue > accountBalance) {
                                console.log(chalk.bgRed.black('O  valor informado é maior que o saldo disponível na conta!'))
                                withdrawAccountBalance()
                            } else {
                                accountData.balance = accountBalance - withdrawValue
                                fs.writeFileSync(
                                    `accounts/${accountName}.json`,
                                    JSON.stringify(accountData),
                                    function (err) {
                                        console.log(err)
                                    },
                                )
                                console.log(chalk.bgBlue.black(`Você sacou ${withdrawValue} da sua conta. Seu saldo atual agora é de: ${accountData.balance}`))
                                operations()
                            }
                        }).catch((err) => {
                            console.log('Erro: ' + err)
                        })
                }
            }
        }).catch((err) => {
            console.log('Erro: ' + err)
        })
}

// transfer an amount between accounts
function transferBalance() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            },
        ]).then((answer) => {
            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return transferBalance()
            } else {
                inquirer
                    .prompt([
                        {
                            name: 'value',
                            message: 'Qual valor deseja transferir?'
                        },
                    ]).then((answer) => {
                        const accountData = getAccount(accountName)
                        const transferValue = answer['value']

                        if (parseFloat(transferValue) > parseFloat(accountData.balance)) {
                            console.log(chalk.bgRed.black('O valor informado é menor que o saldo em sua conta!'))
                            return transferBalance()
                        } else {
                            inquirer
                                .prompt([
                                    {
                                        name: 'transferAccount',
                                        message: `Para qual conta você deseja transferir ${transferValue} reais?`
                                    },
                                ]).then((answer) => {
                                    const transferAccountName = answer['transferAccount']
                                    if (!checkAccount(transferAccountName)) {
                                        return transferBalance()
                                    } else {
                                        const transferAccountData = getAccount(transferAccountName)
                                        accountData.balance = parseFloat(accountData.balance) - parseFloat(transferValue)
                                        fs.writeFileSync(
                                            `accounts/${accountName}.json`,
                                            JSON.stringify(accountData),
                                            function (err) {
                                                console.log(err)
                                            },
                                        )
                                        transferAccountData.balance = parseFloat(transferAccountData.balance) + parseFloat(transferValue)
                                        fs.writeFileSync(
                                            `accounts/${transferAccountName}.json`,
                                            JSON.stringify(transferAccountData),
                                            function (err) {
                                                console.log(err)
                                            },
                                        )
                                        console.log(chalk.bgBlue.black(`Você transferiu ${transferValue} reais para ${transferAccountName}. Seu saldo atual é: ${accountData.balance} reais.`))
                                        operations()
                                    }
                                }).catch((err) => {
                                    console.log('Erro: ' + err)
                                })
                        }
                    }).catch((err) => {
                        console.log('Erro: ' + err)
                    })
            }
        }).catch((err) => {
            console.log('Erro: ' + err)
        })
}

// request an loan
function requestLoan() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual sua conta?'
            }
        ]).then((answer) => {
            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return requestLoan()
            } else {
                const accountData = getAccount(accountName)

                inquirer
                    .prompt([
                        {
                            name: 'loanValue',
                            message: 'Qual o valor do empréstimo que deseja solicitar?'
                        }
                    ]).then((answer) => {
                        const loanValue = answer['loanValue']

                        // if(checkAvailableLoan()){}

                        accountData.loan = parseFloat(accountData.loan) + parseFloat(loanValue)
                        accountData.balance = parseFloat(accountData.balance) + parseFloat(accountData.loan)

                        fs.writeFileSync(
                            `accounts/${accountName}.json`,
                            JSON.stringify(accountData),
                            function (err) {
                                console.log(err)
                            },
                        )
                        console.log(chalk.bgBlue.black(`Aprovado! Você fez um empréstimo de ${loanValue} reais, agora seu saldo atual é: ${accountData.balance} reais`))
                        operations()
                    }).catch((err) => {
                        console.log('Erro: ' + err)
                    })
            }
        }).catch((err) => {
            console.log('Erro: ' + err)
        })
}