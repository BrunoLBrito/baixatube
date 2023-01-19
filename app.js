const express = require('express')
const fs = require('fs')
const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
const miniget = require('miniget')

const cors = require('cors')

const path = require('path')

const app = express()

app.use('/', express.static(__dirname + '/public'))
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'videos')))

const port = process.env.PORT || 3000

// app.get('/', (req, res) => {
// 	return res.sendFile(path.join(__dirname, 'index.html'))
// })

// with await
// let body = await miniget('http://yourwebsite.com').text()

app.get('/debug', async (req, res) => {
	let body = await miniget('https://www.youtube.com/watch?v=RhhSb-gJ6HE').text()

	return res.status(200).send(body)
})

app.get('/search', async (req, res) => {
	console.log(req.query)
	// miniget('https://www.youtube.com', (err, res, body) => {
	// 	console.log('webpage contents: ', body)
	// })

	try {
		const searchResults = await ytsr(req.query.key, { limit: 50 })

		return res.status(200).json(searchResults)
	} catch (err) {
		return res.status(500).json(err)
	}
})

app.get('/convert', async (req, res) => {
	const url = req.query.url
	console.log(url)
	try {
		const info = await ytdl.getInfo(url)

		return res.status(200).json(info)
	} catch (err) {
		return res.status(500).json(err)
	}
})

app.get('/download-video', async (req, res) => {
	try {
		const { url, itag } = req.query

		console.log(req.query)

		const info = await ytdl.getInfo(url)

		// ytdl(url, { filter: 'videoandaudio', quality: 'highestvideo' })
		// 	.pipe(fs.createWriteStream(`videos/${info.videoDetails.title}.mp4`))
		// 	.on('finish', () => res.status(200).json({ video: `${info.videoDetails.title}.mp4`, info }))

		const emoticonsRemove = info.videoDetails.title
			.replace(/[^0-9a-zA-Zㄱ-힣+×÷=%♤♡☆♧)(*&^/~#@!-:;,?`_|<>{}¥£€$◇■□●○•°※¤《》¡¿₩\[\]\"\' \\]/g, '')
			.trim()

		res.header('Content-Disposition', `attachment; filename="${emoticonsRemove}.mp4"`)
		ytdl(url, {
			filter: format => format.itag == itag
		}).pipe(res)
	} catch (err) {
		return res.status(500).json(err)
	}
})

app.get('/download-audio', async (req, res) => {
	try {
		const url = req.query.url
		console.log(req.query)

		const info = await ytdl.getInfo(url)

		// ytdl(url, { filter: 'videoandaudio', quality: 'highestvideo' })
		// 	.pipe(fs.createWriteStream(`videos/${info.videoDetails.title}.mp4`))
		// 	.on('finish', () => res.status(200).json({ video: `${info.videoDetails.title}.mp4`, info }))

		const emoticonsRemove = info.videoDetails.title
			.replace(/[^0-9a-zA-Zㄱ-힣+×÷=%♤♡☆♧)(*&^/~#@!-:;,?`_|<>{}¥£€$◇■□●○•°※¤《》¡¿₩\[\]\"\' \\]/g, '')
			.trim()

		res.header('Content-Disposition', `attachment; filename="${emoticonsRemove}.mp3"`)
		ytdl(url, {
			filter: 'audioonly',
			format: 'mp3',
			quality: 'highest'
		}).pipe(res)
	} catch (err) {
		return res.status(500).json(err)
	}
})

app.listen(port)
