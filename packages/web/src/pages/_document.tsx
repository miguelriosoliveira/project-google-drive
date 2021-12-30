import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
					<link
						rel="stylesheet"
						href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
					/>
					<link rel="icon" type="image/png" href="/img/google-drive-logo.png" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
