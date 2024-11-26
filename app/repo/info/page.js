"use client";

import "katex/dist/katex.min.css";

import { BlockMath, InlineMath } from "react-katex";

import { useRouter } from "next/navigation";

const splitFormula = (text) => {
  if (!text) return [];
  const parts = text.split(/(\$.*?\$)/g);
  return parts.map(part => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return { type: 'math', content: part.slice(1, -1) };
    }
    return { type: 'text', content: part };
  });
};

const Legend = () => {
  const router = useRouter();

    const faqs = [
    {
      question: "How metrics are calculated?",
      answer: "TO-DO"
    },
    {
      question: "When to I need to upload .decl and .dot files when creating a model?",
answer: "TO-DO"    },
    {
      question: "Which of the metrics calculated?",
answer: "TO-DO"    },
    {
      question: "Where can I speicfy purpose and application domain of a model?",
answer: "TO-DO"    },
    {
      question: "Where are uploaded files stored?",
        answer: "TO-DO"
      },
       {
      question: "Do you recommend any tempalte for .txt, .decl, .dot, and image?",
answer: "The recommendation is to export automata, Declare model, textual represetnioan from RuM. Alogside that to take screenshot of image from RuM"    }
  ];
  

  const symbols = [
    {
      symbol: "D = (A, \\mathfrak{C})",
      description: "A Declare process model, where $A$ is a finite set of activities and $\\mathfrak{C}$ is a finite set of constraints (defined over $A$). We assume that each constraint $C \\in \\mathfrak{C}$ is of type $t$"
    },
    {
      symbol: "c_n",
      description: "A weakly connected component in the graph of $D$. Notice: weakly connected components of a Declare model have no constraints between each other and thus can be looked at independently"
    },
    {
      symbol: "\\operatorname{Comp}(D)",
      description: "A finite set of weakly connected components in the graph of $D$"
    },
    {
      symbol: "\\mathfrak{C}_{c_n}",
      description: "The finite set of constraints in a weakly connected component $c_n$"
    },
    {
      symbol: "A_{c_n}",
      description: "The finite set of activities in a weakly connected component $c_n$"
    },
    {
      symbol: "\\phi C",
      description: "The LTL formula corresponding to constraint $C$"
    },
    {
      symbol: "\\mathfrak{C}_{c_n}^t",
      description: "Set of constraints of type $t$ in weakly connected component $c_n$"
    },
    {
      symbol: "T",
      description: "The set of all different constraint templates (or types) in Declare"
    },
    {
      symbol: "T_{c_n}",
      description: "The set of different constraint templates within a weakly connected component $c_n$"
    },
    {
      symbol: "p(c_n, t)",
      description: "Relative frequency of a constraint template $t$ in a weakly connected component $c_n$"
    },
    {
      symbol: "-\\sum_{c_n \\in D, t \\in T_{c_n}} p(c_n,t) \\cdot \\log_{|T|}(p(c_n,t))",
      description: "Shannon entropy of $D$"
    },
    {
      symbol: "A^*",
      description: "Set of sequences of activities from set $A$. $v \\in A^*$ is called a trace. We write $v \\models C$ if $v$ satisfies $\\phi C$"
    },
    {
      symbol: "P(A^*)",
      description: "The power-set of $A^*$"
    },
    {
      symbol: "\\eta(D,v) = \\begin{cases} \\text{true}, & \\text{if } v \\models C \\text{ for each } C \\in \\mathfrak{C} \\\\ \\text{false}, & \\text{otherwise} \\end{cases}",
      description: "A notion of evaluation of a Declare model over a trace $v \\in A^*$"
    },
    {
      symbol: "L(D) = \\{v \\in P(A^*) : \\eta(D,v) = \\text{true}\\}",
      description: "The language of $D$ (i.e., the set of traces that satisfy $D$)"
    }
  ];

  const renderContent = (text) => {
    const parts = splitFormula(text);
    return parts.map((part, index) => (
      <span key={index}>
        {part.type === 'math' ? (
          <InlineMath math={part.content} />
        ) : (
          part.content
        )}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Getting started
              </h1>
              <button
                onClick={() => router.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                Back
              </button>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700">
                      {renderContent(faq.answer)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Symbols Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                List of used symbols
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Symbol</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {symbols.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <InlineMath math={item.symbol} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {renderContent(item.description)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;