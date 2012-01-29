#!/usr/bin/env python

import os
import tempfile
import sys

COMMON_FILES = [
	'headers.js',
	'canvas2D.js',
	'cell.js',
	'minefield.js',
	'minefield_renderer2D.js',
	'minesweeper.js',
	'onload.js'
]

def merge(files):

	buffer = []

	for filename in files:
		with open(os.path.join('..' ,'src', filename), 'r') as f:
			buffer.append(f.read())

	return "".join(buffer)

def output(text, filename):

	with open(os.path.join('..' ,'assets', 'js', filename), 'w') as f:
		f.write(text)

def buildLib(files, filename):

	text = merge(files)

	folder = ''

	filename = filename + '.js'

	print "=" * 40
	print "Compiling", filename


	output(text, folder + filename)

def main(argv=None):

	config = [
	[
	'minesweeper', 'includes', COMMON_FILES ],
	]

	for fname_lib, fname_inc, files in config:
			buildLib(files, fname_lib)

if __name__ == "__main__":
	main()
