function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function foo(argument) {
	console.log('start')
	await timeout(1000)
	

	console.log('end')
}

foo()