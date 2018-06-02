(function (self) {
    var getIdentifiers = function (expression) {
        if (!expression) {
            return [];
        }
        if (expression.type === 'Identifier') {
            return [expression.name];
        } else {
            return getIdentifiers(expression.left)
                .concat(getIdentifiers(expression.right))
                .concat(getIdentifiers(expression.argument));
        }
    }

    var removeDuplicateIdentifiers = function (identifiers) {
        var uniqueSet = [];
        var uniqueValues = [];
        identifiers.forEach(value => {
            if (uniqueSet[value] !== true) {
                uniqueSet[value] = true;
                uniqueValues.push(value);
            }
        });
        return uniqueValues;
    }

    var identifierListsAreEqual = function (listA, listB) {
        if (listA.length !== listB.length) {
            return false;
        }

        for (indexA in listA) {
            if (listB.indexOf(listA[indexA]) === -1) {
                return false;
            }
        }

        return true;
    }

    var createIdentifierCombinations = function (identifiers, combination) {
        if (identifiers.length === 0) {
            return [combination];
        }
        var current = identifiers[0];
        var remaining = identifiers.slice(1);
        return createIdentifierCombinations(remaining, combination + current + " = true; ")
            .concat(createIdentifierCombinations(remaining, combination + current + " = false; "));
    }

    var validateExpressions = function (identifierCombinations, exprA, exprB) {
        var failures = [];
        identifierCombinations.forEach(combination => {
            var fullExprA = combination + "Boolean(" + exprA + ")";
            var fullExprB = combination + "Boolean(" + exprB + ")";
            var resultA = eval(fullExprA);
            var resultB = eval(fullExprB);
            if (resultA !== resultB) {
                failures.push({ combination: combination, resultA: resultA, resultB: resultB });
            }
        });
        return failures;
    }

    var validate = function (expressionA, expressionB) {
        var exprA, exprB;

        try {
            exprA = jsep(expressionA);
        } catch (e) {
            throw ("Expression A: " + e.message);
            return;
        }

        try {
            exprB = jsep(expressionB);
        } catch (e) {
            throw ("Expression B: " + e.message);
            return;
        }

        var identifiersA = getIdentifiers(exprA);
        var identifiersB = getIdentifiers(exprB);

        var uniqueIdentifiersA = removeDuplicateIdentifiers(identifiersA);
        var uniqueIdentifiersB = removeDuplicateIdentifiers(identifiersB);

        if (identifierListsAreEqual(uniqueIdentifiersA, uniqueIdentifiersB) === false) {
            throw ("Expression arguments doesn't match: Expression A (" + uniqueIdentifiersA.join() + "), Expression B (" + uniqueIdentifiersB.join() + ")");
            return;
        }
        var combinations = createIdentifierCombinations(uniqueIdentifiersA, "");

        var errors = validateExpressions(combinations, expressionA, expressionB);

        return errors;
    }

    self.boolLogicValidator = {
        validate
    };
})(this);