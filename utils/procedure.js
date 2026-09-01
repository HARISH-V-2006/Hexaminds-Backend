const { pool } = require("../config/db");

function firstRow(resultSets) {
    if (!resultSets) {
        return null;
    }

    const sets = Array.isArray(resultSets) ? resultSets : [resultSets];

    for (const set of sets) {
        if (Array.isArray(set) && set.length > 0) {
            return set[0];
        }
    }

    return null;
}

function allRows(resultSets) {
    if (!resultSets) {
        return [];
    }

    const sets = Array.isArray(resultSets) ? resultSets : [resultSets];

    for (const set of sets) {
        if (Array.isArray(set)) {
            return set;
        }
    }

    return [];
}

async function callProcedure(procedureName, params = []) {
    const placeholders = params.map(() => "?").join(", ");
    const sql = placeholders
        ? `CALL ${procedureName}(${placeholders})`
        : `CALL ${procedureName}()`;
    const [resultSets] = await pool.query(sql, params);
    return firstRow(resultSets);
}

async function callProcedureAll(procedureName, params = []) {
    const placeholders = params.map(() => "?").join(", ");
    const sql = placeholders
        ? `CALL ${procedureName}(${placeholders})`
        : `CALL ${procedureName}()`;
    const [resultSets] = await pool.query(sql, params);
    return allRows(resultSets);
}

module.exports = { callProcedure, callProcedureAll, firstRow, allRows };