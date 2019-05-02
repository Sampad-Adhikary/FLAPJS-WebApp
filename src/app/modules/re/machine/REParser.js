import RE,
{
	EMPTY,
	CONCAT,
	UNION,
	KLEENE,
	SIGMA,
	EMPTY_SET,
	PLUS
}
from './RE.js';

class ASTNode
{
	constructor(symbol, isTerminal, parentNode, index)
	{
		this._symbol = symbol;
		this._isTerminal = isTerminal;
		this._parent = parentNode;
		this._children = [];
		this._index = index;
	}

	addChild(childNode)
	{
		if (this.hasRoomForChildren())
		{
			this._children.push(childNode);
			this._isTerminal = false;
		}
		else
		{
			throw new Error("Trying to add more than 2 children to an ASTNode");
		}
	}

	replaceChild(originalChild, newChild)
	{
		if (this._children.includes(originalChild))
		{
			let index = this._children.indexOf(originalChild);
			this._children[index] = newChild;
		}
		else
		{
			throw new Error("The child to replace isn't a child already")
		}
	}

	hasRoomForChildren()
	{
		return this._children.length < 2;
	}

	isTerminal()
	{
		return this._isTerminal;
	}

	setTerminal(isTerminal)
	{
		this._isTerminal = isTerminal;
	}

	getSymbol()
	{
		return this._symbol;
	}

	setSymbol(newSymbol)
	{
		this._symbol = newSymbol;
	}

	getParent()
	{
		return this._parent;
	}

	setParent(parentNode)
	{
		this._parent = parentNode;
	}

	getChildren()
	{
		return this._children;
	}

	getIndex()
	{
		return this._index;
	}

	setIndex(index)
	{
		this._index = index;
	}
}

class REParser
{
	constructor()
	{
		this.rootNode = null;
		this.size = 0;
		this.indexToNode = new Map();	// Map of indicies of the regex characters to their ASTNode
		this.closedParensIndicies = [];			// Indicies of the closed parenthesis in the regex
	}

	parseRegex(regex)
	{
		this.rootNode = null;
		this.size = 0;
		regex.clearTerminals();
		if (regex.getExpression().length == 0)
		{
			regex.clear();
			return;
		}
		else if (regex.isExpressionValid())
		{
			let currNode = this.rootNode;
			let openParenStack = [];
			let expression = regex.getExpression();
			let index = -1;

			for (const char of expression)
			{
				this.size = this.size + 1;
				index++;
				switch (char)
				{
				case '(':
					if (!currNode)
					{
						currNode = new ASTNode('(', false, null, index);
						this.indexToNode.set(index, currNode);
						this.rootNode = currNode;
					}
					else
					{
						let newNode = new ASTNode('(', false, currNode, index);
						this.indexToNode.set(index, newNode);
						currNode.addChild(newNode);
						currNode = newNode;
					}
					openParenStack.push(currNode);
					break;
				case ')':
					currNode = openParenStack.pop();
					this.closedParensIndicies.push(index);
					break;
				case KLEENE:
					let kleeneNode = new ASTNode(KLEENE, false, currNode.getParent(), index);
					this.indexToNode.set(index, kleeneNode);
					this.makeParentOf(kleeneNode, currNode);
					currNode = kleeneNode;
					break;
				case PLUS:
					let plusNode = new ASTNode(PLUS, false, currNode.getParent(), index);
					this.indexToNode.set(index, plusNode);
					this.makeParentOf(plusNode, currNode);
					currNode = plusNode;
					break;
				case CONCAT:
					if (!currNode.getParent())
					{
						let concatNode = new ASTNode(CONCAT, false, null, index);
						this.indexToNode.set(index, concatNode);
						this.makeParentOf(concatNode, currNode);
						currNode = concatNode;
					}
					else
					{
						let originalParent = currNode.getParent();
						let parentSym = originalParent.getSymbol();
						if (parentSym == CONCAT)
						{
							let grandparent = originalParent.getParent();
							let concatNode = new ASTNode(CONCAT, false, grandparent, index);
							this.indexToNode.set(index, concatNode);
							this.makeParentOf(concatNode, originalParent);
							currNode = concatNode;
						}
						else
						{
							let concatNode = new ASTNode(CONCAT, false, originalParent, index);
							this.indexToNode.set(index, concatNode);
							this.makeParentOf(concatNode, currNode);
							currNode = concatNode;
						}
					}
					break;

				case UNION:
					if (!currNode.getParent())
					{
						let unionNode = new ASTNode(UNION, false, null, index);
						this.indexToNode.set(index, unionNode);
						this.makeParentOf(unionNode, currNode);
						currNode = unionNode;
					}
					else
					{
						let originalParent = currNode.getParent();
						let sym = originalParent.getSymbol();
						if (sym == '(')
						{
							let unionNode = new ASTNode(UNION, false, originalParent, index);
							this.indexToNode.set(index, unionNode);
							this.makeParentOf(unionNode, currNode);
							currNode = unionNode;
						}
						else
						{
							let grandparent = originalParent.getParent();
							let unionNode = new ASTNode(UNION, false, grandparent, index);
							this.indexToNode.set(index, unionNode);
							this.makeParentOf(unionNode, originalParent);
							currNode = unionNode;
						}
					}
					break;
				case ' ':
					break;
					//For symbols
				default:
					if (!currNode)
					{
						currNode = new ASTNode(char, true, null, index);
						this.indexToNode.set(index, currNode);
						this.rootNode = currNode;
					}
					else
					{
						let symbolNode = new ASTNode(char, true, currNode, index);
						this.indexToNode.set(index, symbolNode);
						currNode.addChild(symbolNode);
						currNode = symbolNode;
					}
					// Add terminals to the regex's terminal set
					if (char != SIGMA && char != EMPTY_SET && char != EMPTY)
					{
						regex.addTerminal(char);
					}
				}
			}
		}
	}

	makeParentOf(newParentNode, targetNode)
	{
		let originalParent = targetNode.getParent();
		newParentNode.setParent(originalParent);
		newParentNode.addChild(targetNode);
		if (originalParent != null)
		{
			originalParent.replaceChild(targetNode, newParentNode);
		}
		targetNode.setParent(newParentNode);

		if (this.rootNode == targetNode)
		{
			this.rootNode = newParentNode;
		}
	}


	// spaceIndex is the index of the space between the characters in the regex
	// E.g.   A U B
	//       0 1 2 3
	// Returns [start_space_index, end_space_index] of the scope
	scopeFromSpaceIndexing(regex, spaceIndex) {
		if(spaceIndex == 0) {
			return [0, 0];
		}
		else if(spaceIndex > 0 && spaceIndex <= this.size + 1) {
			const index = spaceIndex - 1;
			const scope = this.scopeFromCharAtIndex(regex, index);
			// scope will be null if the character selected is just an operand,
			// so nothing should be highlighted
			if (!scope) {
				return [ [spaceIndex, spaceIndex],  [spaceIndex, spaceIndex] ];
			}
			else {
				scope[1][1] += 1	//Increment last index to account for space indexing in highlighting
				return scope
			}
		}
		else {
			throw new Error("Invalid index");
		}
	}

	//Returns [start_index, end_index] of the scope
	scopeFromCharAtIndex(regex, index)
	{
		this.parseRegex(regex);
		let currentNode = this.indexToNode.get(index);
		let symbol = currentNode.getSymbol();
		if(symbol == KLEENE || symbol == PLUS) {
			let smallest = this.smallestIndexOfChildren(currentNode);
			let largest = this.largestIndexOfChildren(currentNode);
			return [ [smallest, smallest], [largest, largest] ];
		}
		else if(symbol == UNION || symbol == CONCAT) {
			let smallest = this.smallestIndexOfChildren(currentNode);
			let largest = this.largestIndexOfChildren(currentNode);
			return [ [smallest, index - 1], [index + 1, largest] ];
		}
		else {
			return null;
		}
	}

	// Return child with the largest index
	largestIndexOfChildren(node)
	{
		let max = node.getIndex();
		for (let child of node.getChildren()) {
			max = Math.max(max, this.largestIndexOfChildren(child));
		}
		return max;
	}

	// Return child with the smallest index
	smallestIndexOfChildren(node)
	{
		let min = node.getIndex();
		for (let child of node.getChildren()) {
			min = Math.min(min, this.smallestIndexOfChildren(child));
		}
		return min;
	}

}

export default REParser;
