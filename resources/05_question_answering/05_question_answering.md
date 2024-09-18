# Question Answering

## Overview

Recall the overall workflow for retrieval augmented generation (RAG):

![overview.jpeg](overview.jpeg)

We discussed `Document Loading` and `Splitting` as well as `Storage` and `Retrieval`.

Let's load our vectorDB. 


```python
import os
import openai
import sys
sys.path.append('../..')

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file

openai.api_key  = os.environ['OPENAI_API_KEY']
```

The code below was added to assign the openai LLM version filmed until it is deprecated, currently in Sept 2023. 
LLM responses can often vary, but the responses may be significantly different when using a different model version.


```python
import datetime
current_date = datetime.datetime.now().date()
if current_date < datetime.date(2023, 9, 2):
    llm_name = "gpt-3.5-turbo-0301"
else:
    llm_name = "gpt-3.5-turbo"
print(llm_name)
```

    gpt-3.5-turbo



```python
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
persist_directory = 'docs/chroma/'
embedding = OpenAIEmbeddings()
vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding)
```


```python
print(vectordb._collection.count())
```

    209



```python
question = "What are major topics for this class?"
docs = vectordb.similarity_search(question,k=3)
len(docs)
```




    3




```python
from langchain.chat_models import ChatOpenAI
llm = ChatOpenAI(model_name=llm_name, temperature=0)
```

### RetrievalQA chain


```python
from langchain.chains import RetrievalQA
```


```python
qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever()
)
```


```python
result = qa_chain({"query": question})
```


```python
result["result"]
```




    'The major topics for this class include machine learning, statistics, and algebra. Additionally, there will be discussions on extensions of the material covered in the main lectures.'



### Prompt


```python
from langchain.prompts import PromptTemplate

# Build prompt
template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. Use three sentences maximum. Keep the answer as concise as possible. Always say "thanks for asking!" at the end of the answer. 
{context}
Question: {question}
Helpful Answer:"""
QA_CHAIN_PROMPT = PromptTemplate.from_template(template)

```


```python
# Run chain
qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever(),
    return_source_documents=True,
    chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
)
```


```python
question = "Is probability a class topic?"
```


```python
result = qa_chain({"query": question})
```


```python
result["result"]
```




    'Yes, probability is a class topic as the instructor assumes familiarity with basic probability and statistics. Thanks for asking!'




```python
result["source_documents"][0]
```




    Document(page_content="of this class will not be very program ming intensive, although we will do some \nprogramming, mostly in either MATLAB or Octa ve. I'll say a bit more about that later.  \nI also assume familiarity with basic proba bility and statistics. So most undergraduate \nstatistics class, like Stat 116 taught here at Stanford, will be more than enough. I'm gonna \nassume all of you know what ra ndom variables are, that all of you know what expectation \nis, what a variance or a random variable is. And in case of some of you, it's been a while \nsince you've seen some of this material. At some of the discussion sections, we'll actually \ngo over some of the prerequisites, sort of as  a refresher course under prerequisite class. \nI'll say a bit more about that later as well.  \nLastly, I also assume familiarity with basi c linear algebra. And again, most undergraduate \nlinear algebra courses are more than enough. So if you've taken courses like Math 51, \n103, Math 113 or CS205 at Stanford, that would be more than enough. Basically, I'm \ngonna assume that all of you know what matrix es and vectors are, that you know how to \nmultiply matrices and vectors and multiply matrix and matrices, that you know what a matrix inverse is. If you know what an eigenvect or of a matrix is, that'd be even better. \nBut if you don't quite know or if you're not qu ite sure, that's fine, too. We'll go over it in \nthe review sections.", metadata={'source': 'docs/cs229_lectures/MachineLearning-Lecture01.pdf', 'page': 4})



### RetrievalQA chain types


```python
qa_chain_mr = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever(),
    chain_type="map_reduce"
)
```


```python
result = qa_chain_mr({"query": question})
```


    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    Cell In[19], line 1
    ----> 1 result = qa_chain_mr({"query": question})


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:166, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)
    --> 166     raise e
        167 run_manager.on_chain_end(outputs)
        168 final_outputs: Dict[str, Any] = self.prep_outputs(
        169     inputs, outputs, return_only_outputs
        170 )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:160, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        154 run_manager = callback_manager.on_chain_start(
        155     dumpd(self),
        156     inputs,
        157 )
        158 try:
        159     outputs = (
    --> 160         self._call(inputs, run_manager=run_manager)
        161         if new_arg_supported
        162         else self._call(inputs)
        163     )
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/retrieval_qa/base.py:120, in BaseRetrievalQA._call(self, inputs, run_manager)
        117 question = inputs[self.input_key]
        119 docs = self._get_docs(question)
    --> 120 answer = self.combine_documents_chain.run(
        121     input_documents=docs, question=question, callbacks=_run_manager.get_child()
        122 )
        124 if self.return_source_documents:
        125     return {self.output_key: answer, "source_documents": docs}


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:293, in Chain.run(self, callbacks, tags, *args, **kwargs)
        290     return self(args[0], callbacks=callbacks, tags=tags)[_output_key]
        292 if kwargs and not args:
    --> 293     return self(kwargs, callbacks=callbacks, tags=tags)[_output_key]
        295 if not kwargs and not args:
        296     raise ValueError(
        297         "`run` supported with either positional arguments or keyword arguments,"
        298         " but none were provided."
        299     )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:166, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)
    --> 166     raise e
        167 run_manager.on_chain_end(outputs)
        168 final_outputs: Dict[str, Any] = self.prep_outputs(
        169     inputs, outputs, return_only_outputs
        170 )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:160, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        154 run_manager = callback_manager.on_chain_start(
        155     dumpd(self),
        156     inputs,
        157 )
        158 try:
        159     outputs = (
    --> 160         self._call(inputs, run_manager=run_manager)
        161         if new_arg_supported
        162         else self._call(inputs)
        163     )
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/combine_documents/base.py:84, in BaseCombineDocumentsChain._call(self, inputs, run_manager)
         82 # Other keys are assumed to be needed for LLM prediction
         83 other_keys = {k: v for k, v in inputs.items() if k != self.input_key}
    ---> 84 output, extra_return_dict = self.combine_docs(
         85     docs, callbacks=_run_manager.get_child(), **other_keys
         86 )
         87 extra_return_dict[self.output_key] = output
         88 return extra_return_dict


    File /usr/local/lib/python3.9/site-packages/langchain/chains/combine_documents/map_reduce.py:144, in MapReduceDocumentsChain.combine_docs(self, docs, token_max, callbacks, **kwargs)
        132 def combine_docs(
        133     self,
        134     docs: List[Document],
       (...)
        137     **kwargs: Any,
        138 ) -> Tuple[str, dict]:
        139     """Combine documents in a map reduce manner.
        140 
        141     Combine by mapping first chain over all documents, then reducing the results.
        142     This reducing can be done recursively if needed (if there are many documents).
        143     """
    --> 144     results = self.llm_chain.apply(
        145         # FYI - this is parallelized and so it is fast.
        146         [{self.document_variable_name: d.page_content, **kwargs} for d in docs],
        147         callbacks=callbacks,
        148     )
        149     return self._process_results(
        150         results, docs, token_max, callbacks=callbacks, **kwargs
        151     )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:186, in LLMChain.apply(self, input_list, callbacks)
        184 except (KeyboardInterrupt, Exception) as e:
        185     run_manager.on_chain_error(e)
    --> 186     raise e
        187 outputs = self.create_outputs(response)
        188 run_manager.on_chain_end({"outputs": outputs})


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:183, in LLMChain.apply(self, input_list, callbacks)
        178 run_manager = callback_manager.on_chain_start(
        179     dumpd(self),
        180     {"input_list": input_list},
        181 )
        182 try:
    --> 183     response = self.generate(input_list, run_manager=run_manager)
        184 except (KeyboardInterrupt, Exception) as e:
        185     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:102, in LLMChain.generate(self, input_list, run_manager)
        100 """Generate LLM result from inputs."""
        101 prompts, stop = self.prep_prompts(input_list, run_manager=run_manager)
    --> 102 return self.llm.generate_prompt(
        103     prompts,
        104     stop,
        105     callbacks=run_manager.get_child() if run_manager else None,
        106     **self.llm_kwargs,
        107 )


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/base.py:178, in BaseChatModel.generate_prompt(self, prompts, stop, callbacks, **kwargs)
        170 def generate_prompt(
        171     self,
        172     prompts: List[PromptValue],
       (...)
        175     **kwargs: Any,
        176 ) -> LLMResult:
        177     prompt_messages = [p.to_messages() for p in prompts]
    --> 178     return self.generate(prompt_messages, stop=stop, callbacks=callbacks, **kwargs)


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/base.py:118, in BaseChatModel.generate(self, messages, stop, callbacks, tags, **kwargs)
        116     run_manager.on_llm_error(e)
        117     raise e
    --> 118 llm_output = self._combine_llm_outputs([res.llm_output for res in results])
        119 generations = [res.generations for res in results]
        120 output = LLMResult(generations=generations, llm_output=llm_output)


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/openai.py:318, in ChatOpenAI._combine_llm_outputs(self, llm_outputs)
        316 for k, v in token_usage.items():
        317     if k in overall_token_usage:
    --> 318         overall_token_usage[k] += v
        319     else:
        320         overall_token_usage[k] = v


    TypeError: unsupported operand type(s) for +=: 'OpenAIObject' and 'OpenAIObject'



```python
result["result"]
```

If you wish to experiment on the `LangSmith platform` (previously known as LangChain Plus):

 * Go to [LangSmith](https://www.langchain.com/langsmith) and sign up
 * Create an API key from your account's settings
 * Use this API key in the code below   
 * uncomment the code  
 Note, the endpoint in the video differs from the one below. Use the one below.


```python
#import os
#os.environ["LANGCHAIN_TRACING_V2"] = "true"
#os.environ["LANGCHAIN_ENDPOINT"] = "https://api.langchain.plus"
#os.environ["LANGCHAIN_API_KEY"] = "..." # replace dots with your api key
```


```python
qa_chain_mr = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever(),
    chain_type="map_reduce"
)
result = qa_chain_mr({"query": question})
result["result"]
```


    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    Cell In[26], line 6
          1 qa_chain_mr = RetrievalQA.from_chain_type(
          2     llm,
          3     retriever=vectordb.as_retriever(),
          4     chain_type="map_reduce"
          5 )
    ----> 6 result = qa_chain_mr({"query": question})
          7 result["result"]


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:166, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)
    --> 166     raise e
        167 run_manager.on_chain_end(outputs)
        168 final_outputs: Dict[str, Any] = self.prep_outputs(
        169     inputs, outputs, return_only_outputs
        170 )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:160, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        154 run_manager = callback_manager.on_chain_start(
        155     dumpd(self),
        156     inputs,
        157 )
        158 try:
        159     outputs = (
    --> 160         self._call(inputs, run_manager=run_manager)
        161         if new_arg_supported
        162         else self._call(inputs)
        163     )
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/retrieval_qa/base.py:120, in BaseRetrievalQA._call(self, inputs, run_manager)
        117 question = inputs[self.input_key]
        119 docs = self._get_docs(question)
    --> 120 answer = self.combine_documents_chain.run(
        121     input_documents=docs, question=question, callbacks=_run_manager.get_child()
        122 )
        124 if self.return_source_documents:
        125     return {self.output_key: answer, "source_documents": docs}


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:293, in Chain.run(self, callbacks, tags, *args, **kwargs)
        290     return self(args[0], callbacks=callbacks, tags=tags)[_output_key]
        292 if kwargs and not args:
    --> 293     return self(kwargs, callbacks=callbacks, tags=tags)[_output_key]
        295 if not kwargs and not args:
        296     raise ValueError(
        297         "`run` supported with either positional arguments or keyword arguments,"
        298         " but none were provided."
        299     )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:166, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)
    --> 166     raise e
        167 run_manager.on_chain_end(outputs)
        168 final_outputs: Dict[str, Any] = self.prep_outputs(
        169     inputs, outputs, return_only_outputs
        170 )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/base.py:160, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, include_run_info)
        154 run_manager = callback_manager.on_chain_start(
        155     dumpd(self),
        156     inputs,
        157 )
        158 try:
        159     outputs = (
    --> 160         self._call(inputs, run_manager=run_manager)
        161         if new_arg_supported
        162         else self._call(inputs)
        163     )
        164 except (KeyboardInterrupt, Exception) as e:
        165     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/combine_documents/base.py:84, in BaseCombineDocumentsChain._call(self, inputs, run_manager)
         82 # Other keys are assumed to be needed for LLM prediction
         83 other_keys = {k: v for k, v in inputs.items() if k != self.input_key}
    ---> 84 output, extra_return_dict = self.combine_docs(
         85     docs, callbacks=_run_manager.get_child(), **other_keys
         86 )
         87 extra_return_dict[self.output_key] = output
         88 return extra_return_dict


    File /usr/local/lib/python3.9/site-packages/langchain/chains/combine_documents/map_reduce.py:144, in MapReduceDocumentsChain.combine_docs(self, docs, token_max, callbacks, **kwargs)
        132 def combine_docs(
        133     self,
        134     docs: List[Document],
       (...)
        137     **kwargs: Any,
        138 ) -> Tuple[str, dict]:
        139     """Combine documents in a map reduce manner.
        140 
        141     Combine by mapping first chain over all documents, then reducing the results.
        142     This reducing can be done recursively if needed (if there are many documents).
        143     """
    --> 144     results = self.llm_chain.apply(
        145         # FYI - this is parallelized and so it is fast.
        146         [{self.document_variable_name: d.page_content, **kwargs} for d in docs],
        147         callbacks=callbacks,
        148     )
        149     return self._process_results(
        150         results, docs, token_max, callbacks=callbacks, **kwargs
        151     )


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:186, in LLMChain.apply(self, input_list, callbacks)
        184 except (KeyboardInterrupt, Exception) as e:
        185     run_manager.on_chain_error(e)
    --> 186     raise e
        187 outputs = self.create_outputs(response)
        188 run_manager.on_chain_end({"outputs": outputs})


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:183, in LLMChain.apply(self, input_list, callbacks)
        178 run_manager = callback_manager.on_chain_start(
        179     dumpd(self),
        180     {"input_list": input_list},
        181 )
        182 try:
    --> 183     response = self.generate(input_list, run_manager=run_manager)
        184 except (KeyboardInterrupt, Exception) as e:
        185     run_manager.on_chain_error(e)


    File /usr/local/lib/python3.9/site-packages/langchain/chains/llm.py:102, in LLMChain.generate(self, input_list, run_manager)
        100 """Generate LLM result from inputs."""
        101 prompts, stop = self.prep_prompts(input_list, run_manager=run_manager)
    --> 102 return self.llm.generate_prompt(
        103     prompts,
        104     stop,
        105     callbacks=run_manager.get_child() if run_manager else None,
        106     **self.llm_kwargs,
        107 )


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/base.py:178, in BaseChatModel.generate_prompt(self, prompts, stop, callbacks, **kwargs)
        170 def generate_prompt(
        171     self,
        172     prompts: List[PromptValue],
       (...)
        175     **kwargs: Any,
        176 ) -> LLMResult:
        177     prompt_messages = [p.to_messages() for p in prompts]
    --> 178     return self.generate(prompt_messages, stop=stop, callbacks=callbacks, **kwargs)


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/base.py:118, in BaseChatModel.generate(self, messages, stop, callbacks, tags, **kwargs)
        116     run_manager.on_llm_error(e)
        117     raise e
    --> 118 llm_output = self._combine_llm_outputs([res.llm_output for res in results])
        119 generations = [res.generations for res in results]
        120 output = LLMResult(generations=generations, llm_output=llm_output)


    File /usr/local/lib/python3.9/site-packages/langchain/chat_models/openai.py:318, in ChatOpenAI._combine_llm_outputs(self, llm_outputs)
        316 for k, v in token_usage.items():
        317     if k in overall_token_usage:
    --> 318         overall_token_usage[k] += v
        319     else:
        320         overall_token_usage[k] = v


    TypeError: unsupported operand type(s) for +=: 'OpenAIObject' and 'OpenAIObject'



```python
qa_chain_mr = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever(),
    chain_type="refine"
)
result = qa_chain_mr({"query": question})
result["result"]
```




    'The class will assume familiarity with basic probability and statistics, as well as basic linear algebra. The instructor mentioned that most undergraduate statistics classes, like Stat 116 at Stanford, will provide sufficient background knowledge for the probability topics covered in the course. Additionally, undergraduate linear algebra courses such as Math 51, 103, Math 113, or CS205 at Stanford will be more than enough to understand the basic linear algebra concepts discussed in the class. The probabilistic interpretation of linear regression will be used to derive the next learning algorithm, which will be the first classification algorithm discussed in the course. This algorithm will address classification problems where the predicted variable Y takes on discrete values, such as binary classification where Y has only two possible values. The discussion sections will also be used to review and extend the material covered in the main lectures, providing additional support for students who may need a refresher on statistics or algebra concepts.'



### RetrievalQA limitations
 
QA fails to preserve conversational history.


```python
qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=vectordb.as_retriever()
)
```


```python
question = "Is probability a class topic?"
result = qa_chain({"query": question})
result["result"]
```




    'Yes, probability is a class topic. The instructor assumes familiarity with basic probability and statistics for the class.'




```python
question = "why are those prerequesites needed?"
result = qa_chain({"query": question})
result["result"]
```




    'The prerequisites for the class are needed because the course assumes that all students have a basic knowledge of computer science and computer skills. This foundational knowledge is essential for understanding the concepts and materials covered in the class, such as big-O notation and basic computer principles.'



Note, The LLM response varies. Some responses **do** include a reference to probability which might be gleaned from referenced documents. The point is simply that the model does not have access to past questions or answers, this will be covered in the next section.


```python

```
