---
title: Enabling RLM Inference with Shared Program State
authors: 
  - name: Ellie Y. Cheng
    affiliation: MIT CSAIL
  - name: Logan Weber
    affiliation: MIT CSAIL
  - name: Tian Jin
    affiliation: MIT CSAIL
  - name: Michael Carbin
    affiliation: MIT CSAIL
excerpt: RLM inference comes for free in programming systems using shared program state.

layout: post
css: post.css
---

Two recent lines of work have revealed a common design pattern of using LLM for automated state management. Recursive Language Models (RLMs){% cite zhang2025recursive --file enabling-rlm-with-shared-program-state %} automates the work of managing long prompt contexts using by allowing LLMs to self-decompose context prompts. Our recent paper on **shared program state**{% cite cheng2025sharing --file enabling-rlm-with-shared-program-state %} automates the work of integrating natural code in programs by allowing LLMs to modify the program state through a controlled interface. The common pattern of using an LLM for automated state management means programs using shared program state can easily use RLMs.

In this blog post, we show how to enable the RLM inference strategy in only a few lines of code in a program with shared program state.

## What are Recursive Language Models?

First, let’s talk about what the RLM inference strategy is: RLMs leverages the LLM to automate context management. The LLM is set up with a Python environment to manage its context prompt and the context prompts of recursive sub-LLM calls. The LLM issues Python code to view portions of the context, programmatically parse contexts, perform Python-based computations, and/or compose contexts for sub-LLM calls. 

In short, enabling RLMs consists of enabling:
1. LLM-driven context management, and
2. Recursive LLM calls.

The key insight here is that enabling RLM means enabling a limited form of *shared program state*, particularly in which the LLM uses Python and recursive LLM calls as its interface language to the state.

## What is Shared Program State?

Shared program state is a programming abstraction that offloads the work of managing LLM call inputs and outputs within a host program. Using shared program state, the embedded natural code directly read/write program variables, manipulate program data, and implement control flow in the program. The LLM agent that executes the natural code is setup to issue *effects*, which are distinguished requests of services to the host program; *handlers*, implemented in the host system, dispatch these effects with respect to the host program state. 

<div class="center">
<img src="/assets/images/posts/enabling-rlm-with-shared-program-state/example_diagram.png" style="width:90%" />
</div>

For example, in the figure above, <span class="fig-label">(a)</span> a program with embedded natural code (`"Perform the <query>..."`) using shared program state first executes as normal in the host system. <span class="fig-label">(b)</span> Executing the statement `query = input("Q: ")` makes the variable assignment to the variable `query` with user input, which is the string `"Exit, please."`. When encountering natural code, <span class="fig-label">(c)</span> the host system hands execution control to the LLM. The LLM issues effects to the program state to execute the natural code. Here, <span class="fig-label">(d)</span> the LLM issues a `Lookup` request to read the `query` variable. The handler resolves these effects by interface with the host program state: <span class="fig-label">(e)</span> The handler reads `query` from the shared variable scopes, <span class="fig-label">(f)</span> which has the value `"Exit please."` <span class="fig-label">(g)</span> The handler resumes natural code execution with the retrieved value, and the LLM continues executing the natural code. <span class="fig-label">(h)</span> the LLM issues another request `Goto`, to update the evaluation context to the `break` program value (i.e. outside the `while`-loop). This is an abortive effect, meaning that the handler does not resume natural code execution. Instead, <span class="fig-label">(i)</span> the handler updates the program control state, thus implementing control flow.

In the above example, the LLM agent uses a specialized DSL (domain specific language) as effects. This interface language is referred to as the *execution substrate*. Other execution substrate designs are also possible, such as using Python code. We defer additional details of enabling shared program state to our paper {% cite cheng2025sharing --file enabling-rlm-with-shared-program-state %}. With the paper, we also released the **Nightjar** Python library that enables shared program state for natural code in Python programs.

## Enabling RLM in Programs with Shared Program State

We will explain how RLMs comes for free in programs with shared program state by an example program using our Nightjar library. The example is a program for executing the `trec_coarse` split of the OOLONG{% cite bertsch2025oolong --file enabling-rlm-with-shared-program-state %} benchmark, which was used in the RLM work{% cite zhang2025recursive --file enabling-rlm-with-shared-program-state %}. 

The `trec_coarse` benchmark requires answering queries about (potentially large) datasets of questions associated with user IDs and dates, provided as a string dump. The queries ask about a semantic label for each question (but the dataset does not contain explicit labels).

Below is the program written using Nightjar:

```python
import nightjarpy as nj

@nj.fn(config=nj.configs.INTERPRETER_PYTHON_NESTED_JSON_CONFIG)
def oolong_synth_rlm(context, question):
    """natural
    Look at <question>, and <context>. Save the answer to <question> as <:answer> as a string in the
    format specified in <question>
    """
    return answer
```

That’s it! Let’s go over each component of the program.

### Syntax

The decorator `@nj.fn` enables inline natural code using a triple-quoted string with the natural language identifier. Natural code blocks can be embedded anywhere Python statements can go, including within `for` loops, nested functions, `with` blocks, etc. 
`@nj.fn` takes a configuration object for adjusting natural code execution settings, such as the base LLM model, the max number of iterations allotted for the agent, the agent system prompt etc. 

Python variables that the LLM executing the natural code can read are denoted as `<var>` in the natural code. Python variables that the LLM must write by the end of the natural code execution before switching back to the Python runtime are denoted as `<:var>`.

Nightjar enables shared program state: the embedded natural code has direct read and write access to the program state (the variable scopes, the heap, and the control state) of the program that the natural code is embedded in. In this example, the natural code automatically reads the `question` and `context` Python variables and writes a string value to the Python variable `answer`, that can be used after the natural code like any other Python variable. 

### Enabling RLMs

As discussed earlier, enabling RLM requires 1) LLM-driven context management, and 2) recursive LLM calls. With shared program state, Nightjar automatically enables the first. Nightjar also supports configuration to do the second.

<span class="para">LLM Context Management.</span>
To enable shared program state, Nightjar uses an LLM agent to interface with the host program state through effects and handlers. In doing so, the LLM automatically performs state management, where the state is the host program state. When using an RLM to perform LLM inference in a program, the context prompt is a part of the host program state. This means that Nightjar automatically enables LLM-driven context management.

<span class="para">Recursive LLM Calls.</span>
Nightjar supports a number of execution substrates, the method or interface by which the LLM accesses the program state. One of the supported execution substrate is using Python code. Additionally, programmers can configure whether the LLM agent can issue LLM calls in the Python code. Recursive LLM calls are enabled by setting the execution substrate as `PYTHON_LLM` (as opposed to `PYTHON` which does not enable recursive LLM calls). 

```python
import nightjarpy as nj

config = nj.configs.DEFAULT_CONFIG.with_interpreter_updates(
    execution_substrate=nj.configs.ExecutionSubstrate.PYTHON_LLM, 
    recursion_limit=1
)
```

Setting `recursion_limit` to greater than 1 enables nested natural blocks that uses shared program state.

Nightjar provides recommended preset configurations. Specifically, `INTERPRETER_PYTHON_LLM_JSON_CONFIG` is the preset configuration corresponding to RLMs.

Nightjar can also be configured to use different LLM settings between the root model and the recursive LLM calls. `with_llm_updates` changes the root model settings and `with_compute_llm_updates` changes the recursive model settings.

```python
import nightjarpy as nj

config = nj.configs.INTERPRETER_PYTHON_NESTED_JSON_CONFIG.with_llm_updates(
    model='openai/gpt-5',
    reasoning_effort='medium',
).with_compute_llm_updates(
    model='openai/gpt-5-mini',
    reasoning_effort='medium',
)
```


## Evaluation

We evaluated the above program to show that using RLMs through Nightjar achieves parity to the official RLM implementation. 

### Methodology

We evaluated the tasks with context window length of 131k, following the RLM paper{% cite zhang2025recursive --file enabling-rlm-with-shared-program-state %}. We also follow their experimental setup to use GPT-5 with medium reasoning effort as the root LLM and GPT-5-mini with medium reasoning as the sub-LLMs and to set recursion depth limit to 1. We ran the benchmarks for N=3 runs and report the mean and standard deviation of metrics across runs.

We compare the performance of the following methods:

- **LLM:** Direct GPT-5 query with entire context prompt.
- **RLM:** The official RLM library with GPT-5 root LLM and GPT-5-mini sub-LLM.
- **Nightjar:** Ablation using Nightjar with GPT-5 and with recursive LLM calls disabled. The LLM agent still has access to the program state (and thus the context in the program state).
- **Nightjar (RLM-Enabled):** Nightjar with recursive LLM calls, thus enabling RLM, with GPT-5 root LLM and GPT-5-mini sub-LLM.

### Results

As shown below, Nightjar (RLM-Enabled) achieves a slightly higher score to RLM, demonstrating that using the RLM mode in Nightjar is a competitive alternative to using RLM via the official implementation. The Nightjar ablation without recursive LLM calls achieves comparable score to the base LLM, but performs worse than RLM and Nightjar (RLM-Enabled). This demonstrates that the agent setup does not significantly result in accuracy improvements, but the recursive LLM calls does boost accuracy.

<div class='center'>
<img src="/assets/images/posts/enabling-rlm-with-shared-program-state/oolong_score.png" style="width:55%"/>
</div>

Below are plots comparing input tokens, output tokens, and execution time of using each method. The y-axis shows the score. 

<div class='center'>
<img src="/assets/images/posts/enabling-rlm-with-shared-program-state/oolong_inp_time.png" style="width:100%"/>
</div>

RLM uses the most input tokens, while Nightjar (RLM-enabled) uses the most output tokens. Notably, the base LLM uses more input tokens than Nightjar and Nightjar (RLM-enabled) but has the lowest score. This shows that LLM in Nightjar and Nightjar (RLM-enabled) can manage the context efficiently. 

Nightjar (RLM-enabled) has similar execution time to the official RLM implementation. RLM, Nightjar, and Nightjar (RLM-enabled) are 6.9-7.7x slower than using the base LLM as they rely on an LLM agent.

Using the RLM inference strategy in Nightjar is a comparable to using the official RLM implementation on tasks like the above, where the context is represented as a long string of data. Nightjar also provides other benefits when writing programs because it enables shared program state.

## State is More Than Text

Context is often more than just text in a program. Let’s take a look at an example task to implement a console that answers natural language queries on a paper citation graph. 

### Context Data

In this task, the context is a directed graph data structure. We define the data structure like so:

```python
class Graph:
    def __init__(self, nodes: set[int], edges: dict[int, set[int]]):
	    self.nodes = nodes
    self.edges = edges
    
graph = Graph(nodes=set([0, 1, 2, ...]), edges={0: set([1, ...]), ...})
```

The graph keeps a set of the node IDs in the graph, as well as a mapping of source graph IDs to destination graph IDs. 

### Task

To make the console, we use a `while` loop with the Python `input` function to read from standard input. We expect a response string to print to standard output after processing the input query:

```python
def main(graph: Graph):
    while True:
        query = input("Q: ")
            
        # Query processing task
                    
        print(f"A: {response}")
```

The query processing task to complete the program is then to:

1. Read user query,
2. Update the graph data structure according to the query, and 
3. If the user query indicates that the user wants to exit from the program, stop reading queries and gracefully exit.

### Program without Shared Program State (i.e. no Nightjar)

Let’s first try to implement this program without shared program state. This means we will need to implement how the context is given to the LLM and how the LLM response converts to updates in the program state. This results in this program:

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

def serialize(g: Graph) -> str:
    s = {
        "nodes": list(g.nodes),
        "edges": [{"src": src, "tgts": list(tgts)} for src, tgts in g.edges.items()],
    }
    return json.dumps(s)

def reify(enc_g: Dict) -> Graph:
    nodes = set(enc_g["nodes"])
    edges = {e["src"]: set(e["tgts"]) for e in enc_g["edges"]}
    return Graph(nodes=nodes, edges=edges)

def main(graph: Graph):
    while True:
        query = input("Q: ")
                    
        class OutputSchema(BaseModel):
            response: Optional[str]
            break_flag: bool
            graph: Optional[GraphSchema]
                        
        res = client.responses.parse(
            model="gpt-5",
            input=f"""Perform the <query> with respect to <graph>, where nodes are paper IDs and edges point from a cited paper to a set of papers that cite it. Return `break` as True if the <query> indicates termination. Else, return a `response`. If the <graph> was updated, return it as `graph`. `response` should contain only the value, no prefix or suffix.
<query>{query}</query>
<graph>{serialize(graph)}</graph>""",
            text_format=OutputSchema,
        ).output_parsed
        
        if res is None:
            raise ValueError("No response from model")
            
        if res.break_flag:
            break
        response = res.response
        if res.graph is not None:
            graph = reify(res.graph.model_dump())

        print(f"A: {response}")
```

Without shared program state, the programmer has to implement:

1. How the graph is given to the LLM: By serializing into a string, embedded into the context prompt.
2. How the LLM should specify the changes to the program state: By generating a JSON output of the response string, a flag indicating whether to `break` from the `while` loop, and an optional updated graph.
3. How the LLM-specified changes reflects on the program state: LLM updates entire updated graph, so the post-processing code updates the `graph` variable with the reified LLM-generated graph.

This is one way to implement how the LLM should specify changes to the program state. The programmer can also use alternative methods. For example the programmer can define and write code to parse a graph DSL that the LLM generates to answer the user query, to avoid extensive token generation by generating the entire updated graph. However, the programmer must reason about and implement this integration between the program state and the LLM. 

As shown, without Nightjar and shared program state, the burden is on the programmer to implement how the LLM accesses the context data (the graph) and how the response from the LLM is integrated with the program state.



### Program with Shared Program State (i.e. with Nightjar)

In contrast, Nightjar and shared program state offloads the work of reading and updating the program state when executing natural code to the LLM. Below is the program implementing the task using Nightjar:

```python
import nightjar as nj

@nj.fn
def main(graph: Graph):
    while True:
        query = input("Q: ")
                    
        """natural
        Perform the <query> with respect to <graph>, where nodes are paper IDs and edges point from a cited
        paper to a set of papers that cite it. Break if <query> indicates termination. Else, save a
        <:response> and update <graph> to answer <query>. <:response> should contain only the value,
        no prefix or suffix.
        """
            
        print(f"A: {response}")
```

As seen above, the programmer only needs to write the core logic of the task.

The entire program state is the context within which the natural code is executed. Nightjar, by enabling natural code to shared the host program state, also supports letting the LLM manage Python data beyond strings types, such as lists, dictionaries, and graphs. Natural code can also manage the control state of the program, meaning it can implement control flow, such as breaking out of loops.

By using Nightjar and shared program state, the program is a lot more simple and straightforward.

## Note on Safety

As with most software using LLMs, Nightjar should be used cautiously. In other programming systems and libraries that enable LLM usage in programs with isolated program states, the programmer is in full control of what the LLM sees and writes. Shared program state gives some of this control to the LLM in exchange for automation and abstraction. Nightjar employs some safety mechanisms to safeguard LLM hallucinations such as by restricting variable accesses and variable writes to those denoted in the prompt. See our paper{% cite cheng2025sharing --file enabling-rlm-with-shared-program-state %} for more details on the safety measures. 

We also recommend running Nightjar programs in a container just in case.

## Roadmap

There are still a lot of new features and performance improvements planned for Nightjar and shared program state. Some of which are:

- **Execution Substrate Designs:** Nightjar is designed to be easy to hot-swap and to extend with new execution substrate designs, i.e. the medium by which the LLM interfaces with the program state. Different designs results in different accuracy and runtime and are suited for different applications. For example, using Python with and without LLM calls are two different execution substrates with different performance profiles. Nightjar currently supports three designs: A custom DSL, Python, and Python with LLM calls. We are continuing exploration of new execution substrate designs to improve program accuracy and runtime. **We welcome contributions from the community for new execution substrate designs.**
- **QOL:** We plan to release some quality of life extensions for syntax highlighting, linting, etc.
- **Safety Mechanisms:** We are exploring different strictness levels of safety mechanisms, such as type-checking, and invariant checking.

Stay tuned for more improvements to Nightjar. 

## Closing Remarks

Nightjar and shared program state is not the end to the challenge of regaining high-level abstractions when programming with natural code. Nightjar and shared program state reduces the friction when using natural code in formal programs, but there remains a lot of complexity when using natural code in general due to issues in robustness and interpretability. We hope to see more works in reducing natural code complexity while retaining gains in robustness and interpretability.

<!--  -->

## Citation

<pre>@misc{cheng2026sharedstaterlm,
    title        = {Enabling RLM Inference with Shared Program State},
    author       = {Cheng, Ellie Y. and Weber, Logan and Jin, Tian and Carbin, Michael},
    year         = {2026},
    month        = {January},
    howpublished = {Blog post},
    url          = {http://elliecheng/blog/2026/01/20/enabling-rlm-with-shared-program-state/}
}</pre>

## References
<div class="references">
    {% bibliography --file enabling-rlm-with-shared-program-state --cited %}
</div>
