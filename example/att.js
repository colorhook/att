var parser = require("../parser/XMLParser.js");

var project = parser.parseFile(__dirname + "/att.xml");
project.run();