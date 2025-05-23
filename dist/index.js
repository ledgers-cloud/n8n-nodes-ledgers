"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const Ledgers_node_1 = require("./nodes/LEDGERS/Ledgers.node");
const LEDGERSApi_credentials_1 = require("./credentials/LEDGERSApi.credentials");
exports.nodes = [new Ledgers_node_1.Ledgers()];
exports.credentials = [new LEDGERSApi_credentials_1.LEDGERSApi()];
