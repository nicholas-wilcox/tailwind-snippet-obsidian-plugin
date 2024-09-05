import debug from "debug";

export const log = debug("tailwind-snippet");
export const INFO = log.extend("INFO");
export const DEBUG = log.extend("DEBUG");
export const ERROR = log.extend("ERROR");
