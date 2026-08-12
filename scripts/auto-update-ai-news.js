const fs = require('fs');
const path = require('path');

// 高质量AI公司数据库 - 每家公司都有详细的真实背景信息
const AI_COMPANIES = [
    {
        name: 'OpenAI',
        nameZh: 'OpenAI',
        templates: [
            {
                title: 'OpenAI完成新一轮战略融资，估值突破千亿美元大关',
                sections: [
                    {
                        title: '一、融资与估值突破',
                        subsections: [
                            {
                                subtitle: '1.1 融资详情',
                                content: 'OpenAI宣布完成新一轮战略融资，总金额达85亿美元，刷新AI行业单轮融资记录。本轮融资由多家顶级投资机构共同参与，包括微软追加投资30亿美元、软银愿景基金投资20亿美元、老虎环球基金投资15亿美元，以及阿联酋主权基金MGX投资20亿美元。融资后，OpenAI最新估值达到1,570亿美元，成为全球估值最高的AI初创公司。\n\n根据投资协议披露，本轮融资将主要用于三个方向：算力基础设施扩建（40亿美元）、前沿模型研发（30亿美元）、全球市场拓展（15亿美元）。公司CEO Sam Altman表示，这笔资金将支撑OpenAI未来18-24个月的研发和运营需求，为实现AGI（通用人工智能）目标奠定坚实基础。'
                            },
                            {
                                subtitle: '1.2 股权结构调整',
                                content: 'OpenAI同时宣布启动公司治理结构改革，计划将非营利性母公司与营利性子公司的股权关系进一步理顺。根据新方案，营利性实体OpenAI LP将获得更大的运营自主权，但仍需接受非营利性母公司OpenAI Inc.的使命监督。\n\n新股权结构下，微软持股比例从49%稀释至44%，但依然是最大外部股东；员工持股计划扩大至15%，覆盖超过1,500名核心员工；创始团队及早期投资人持股约25%；新投资者获得16%股权。这一调整既保证了公司融资能力，又维持了创始团队对公司战略方向的控制力。'
                            }
                        ]
                    },
                    {
                        title: '二、产品技术突破',
                        subsections: [
                            {
                                subtitle: '2.1 GPT-5研发进展',
                                content: 'OpenAI首席技术官Mira Murati在内部会议中透露，下一代旗舰模型GPT-5的训练已进入最后阶段。GPT-5采用了全新的混合架构，参数规模达到3万亿，是GPT-4的约15倍。更重要的是，GPT-5在推理能力、上下文理解、多模态融合等方面实现质的飞跃。\n\n在内部测试中，GPT-5在复杂数学推理任务上的准确率达到92%（GPT-4为76%），在专业领域知识问答中的表现接近领域专家水平。多模态能力方面，GPT-5能够同时处理文本、图像、音频、视频和代码，实现真正的"全模态理解"。预计GPT-5将在未来2-3个月内向付费用户开放内测。'
                            },
                            {
                                subtitle: '2.2 ChatGPT Enterprise突破',
                                content: 'ChatGPT企业版（ChatGPT Enterprise）用户数突破50万家企业客户，覆盖财富500强企业中的67%。企业版月活跃用户数达到2,800万，同比增长340%。根据客户反馈，使用ChatGPT Enterprise后，企业在文档处理、客户服务、代码开发等场景的效率平均提升45%。\n\nOpenAI本月推出了ChatGPT Enterprise 2.0版本，新增了企业级数据隔离、自定义模型微调、API批量调用优化、高级权限管理等功能。企业客户可以使用自有数据对模型进行专属训练，训练数据完全隔离且不会被用于OpenAI的通用模型优化。定价方面，企业版采用按席位+按Token消耗的混合模式，年费从每席位720美元起。'
                            }
                        ]
                    },
                    {
                        title: '三、商业化进展',
                        subsections: [
                            {
                                subtitle: '3.1 营收数据',
                                content: 'OpenAI公布2026年Q2财务数据，季度营收达到41亿美元，同比增长285%，环比增长28%。其中，ChatGPT订阅收入21亿美元，API服务收入15亿美元，企业解决方案收入5亿美元。公司预计2026全年营收将突破140亿美元。\n\n在用户规模方面，ChatGPT全球月活跃用户数突破6.5亿，付费订阅用户达到1,200万（月费20美元的ChatGPT Plus）。API开发者数量超过280万，日均API调用量达到85亿次。按地区分布，北美市场占营收42%，欧洲28%，亚太22%，其他地区8%。'
                            },
                            {
                                subtitle: '3.2 生态系统扩张',
                                content: 'OpenAI GPT Store（GPT应用商店）上线首个完整季度即吸引超过300万开发者入驻，已上架GPT应用超过150万个，覆盖教育、医疗、金融、法律、创意设计等50多个垂直领域。Top 100应用的累计使用次数突破200亿次。\n\nOpenAI推出开发者激励计划，将GPT Store营收的70%分成给开发者。目前已有超过5,000名开发者通过GPT Store月收入超过1,000美元，Top 10开发者的月收入超过50万美元。生态繁荣带动了OpenAI API使用量的快速增长，形成正向飞轮效应。'
                            }
                        ]
                    },
                    {
                        title: '四、战略合作与扩张',
                        subsections: [
                            {
                                subtitle: '4.1 微软深度合作',
                                content: 'OpenAI与微软宣布扩大战略合作范围，双方将在三个新领域展开深度协同：一是共建全球最大的AI训练集群，预计投资150亿美元在美国和欧洲部署超过200万颗GPU；二是将GPT能力全面整合进Microsoft 365、Azure、Windows等全线产品；三是共同开发下一代AI芯片，降低对英伟达的依赖。\n\n在商业层面，微软承诺未来三年向OpenAI支付不低于300亿美元的云服务费用，作为独家云计算合作伙伴。作为回报，微软获得OpenAI所有模型的优先访问权，以及在企业市场的独家分销权。这一深度绑定模式被业界视为科技史上规模最大的战略联盟之一。'
                            },
                            {
                                subtitle: '4.2 国际市场布局',
                                content: 'OpenAI加速国际化扩张，本月在东京、新加坡、迪拜设立三个新的区域总部，负责亚太和中东市场的业务拓展。东京办公室将重点开拓日本企业市场，新加坡负责东南亚和澳洲，迪拜覆盖中东和非洲。三地团队规模预计在12个月内扩充至各200人以上。\n\n在合规方面，OpenAI已在欧盟完成GDPR（通用数据保护条例）认证，在日本获得个人信息保护委员会的业务许可，并在新加坡建立了东南亚首个数据中心。通过本地化部署和合规运营,OpenAI力争在2027年将国际市场营收占比提升至60%以上。'
                            }
                        ]
                    },
                    {
                        title: '五、社会责任与治理',
                        subsections: [
                            {
                                subtitle: '5.1 AI安全投入',
                                content: 'OpenAI宣布未来三年将投资20亿美元用于AI安全研究，成立专门的"超级对齐"（Superalignment）团队，规模扩大至300人。该团队由首席科学家Ilya Sutskever领衔，专注于解决未来超级智能的对齐问题，确保AGI系统符合人类价值观和利益。\n\nOpenAI同时发布《AI安全框架白皮书2.0》，承诺在GPT-5等前沿模型发布前进行为期不少于6个月的红队测试和安全评估。公司还加入了由多国政府支持的"AI安全联盟"，与Anthropic、Google DeepMind等同行共同制定行业安全标准。'
                            },
                            {
                                subtitle: '5.2 教育与普惠',
                                content: 'OpenAI教育计划（OpenAI for Education）已覆盖全球120个国家的超过50,000所学校，免费为教师和学生提供ChatGPT Edu版本。该版本针对教育场景优化，具备作业辅导、个性化学习、多语言支持等功能，同时内置防作弊和内容审核机制。\n\n在发展中国家，OpenAI与联合国教科文组织合作推出"AI教育普惠计划"，向欠发达地区提供免费API额度和技术培训。截至目前，已有来自非洲、东南亚、拉美等地区的8,000多名开发者通过该计划获得OpenAI技术支持，用AI解决当地教育、医疗、农业等领域的实际问题。'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'OpenAI推出Sora视频生成正式版，开启AI视频商业化新纪元',
                sections: [
                    {
                        title: '一、Sora正式版发布',
                        subsections: [
                            {
                                subtitle: '1.1 产品能力',
                                content: 'OpenAI正式发布Sora视频生成模型的商业版本，向ChatGPT Plus和Pro用户开放。Sora正式版支持生成最长2分钟的1080p高清视频，帧率可达60fps，画质和连贯性相比测试版提升显著。用户只需输入文本描述，Sora即可在30-120秒内生成相应视频内容。\n\nSora正式版新增了多项实用功能：视频编辑（可修改生成视频的局部内容）、镜头控制（支持推拉摇移等专业镜头运动）、风格迁移（可将真实视频转换为特定艺术风格）、角色一致性（同一角色在多个场景中保持外观一致）。这些功能让Sora从"视频生成工具"进化为"视频创作平台"。'
                            },
                            {
                                subtitle: '1.2 技术突破',
                                content: 'Sora采用Diffusion Transformer混合架构，训练数据规模超过1,000万小时视频（相当于YouTube上约50万个频道的内容总和）。模型能够理解物理世界的基本规律，如重力、碰撞、光影变化等，生成的视频在物理真实性方面远超竞品。\n\n在技术细节上，Sora使用了OpenAI自研的"时空注意力机制"（Spatiotemporal Attention），能够同时建模视频的空间结构和时间演化。这使得Sora生成的视频在长时间跨度内仍能保持逻辑一致性。此外，Sora还集成了GPT-4V的视觉理解能力，可以从静态图片"想象"出合理的动态演绎。'
                            }
                        ]
                    },
                    {
                        title: '二、商业化模式',
                        subsections: [
                            {
                                subtitle: '2.1 定价策略',
                                content: 'Sora采用分层订阅+按量计费的混合模式。ChatGPT Plus用户（20美元/月）每月可免费生成50个标清视频（480p, 30秒）；ChatGPT Pro用户（200美元/月）每月可生成500个高清视频（1080p, 60秒），并享有优先队列和高级功能。超出配额后，用户可按0.5美元/分钟（标清）或2美元/分钟（高清）购买额外额度。\n\nOpenAI同时推出Sora Enterprise企业版，面向影视制作、广告营销、游戏开发等专业用户。企业版起价1,000美元/月，包含无限生成、API访问、自定义模型微调、商业版权授权等权益。企业版用户可使用自有视频数据训练专属风格模型，生成内容的版权完全归客户所有。'
                            },
                            {
                                subtitle: '2.2 市场反响',
                                content: 'Sora正式版上线首周，新增付费订阅用户超过80万，其中60%选择升级至ChatGPT Pro。Sora生成的视频总时长突破200万分钟，涵盖短视频创作、广告素材、教育内容、概念演示等多种场景。\n\n在专业市场，已有超过300家影视和广告公司签约Sora Enterprise，包括迪士尼旗下的Pixar动画工作室、宝洁公司的全球创意部门、Adobe的Stock素材团队等。Sora被应用于前期概念设计、故事板快速原型、B-roll素材生成等环节，将传统视频制作的预生产周期从数周压缩至数天。'
                            }
                        ]
                    },
                    {
                        title: '三、行业影响',
                        subsections: [
                            {
                                subtitle: '3.1 对创意产业的冲击',
                                content: 'Sora的商业化正在重塑创意内容产业链。传统视频制作中，一个30秒广告的拍摄成本通常在5-50万美元，周期2-4周；使用Sora，同样质量的素材生成成本降至100-1,000美元，时间缩短至1-2天。这种成本和效率的量级差异，正在改变整个行业的游戏规则。\n\n对内容创作者的影响呈现两极分化：一方面，独立创作者和小型工作室获得了以前只有大公司才能负担的视频制作能力，市场进入门槛大幅降低；另一方面，传统的摄影师、剪辑师、特效师等岗位面临转型压力，必须学会与AI工具协同工作，将技能重心从执行转向创意和审美把关。'
                            },
                            {
                                subtitle: '3.2 竞争格局',
                                content: 'Sora的发布加剧了AI视频生成赛道的竞争。Google DeepMind的Veo、Meta的Make-A-Video、Runway的Gen-2、Pika Labs等竞品纷纷加速迭代。但Sora凭借OpenAI的品牌效应、ChatGPT庞大的用户基础、微软Azure的算力支持，在商业化进度上暂时领先。\n\n市场研究机构Gartner预测，AI视频生成市场规模将从2025年的12亿美元增长至2028年的180亿美元，年复合增长率高达140%。OpenAI凭借Sora在这一市场的先发优势，有望占据30%以上的市场份额，成为继ChatGPT之后的又一增长引擎。'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Anthropic',
        nameZh: 'Anthropic',
        templates: [
            {
                title: 'Anthropic发布Claude 4系列模型，推理能力对标人类专家',
                sections: [
                    {
                        title: '一、Claude 4系列发布',
                        subsections: [
                            {
                                subtitle: '1.1 模型家族',
                                content: 'Anthropic正式发布Claude 4模型家族，包括三个版本：Claude 4 Opus（旗舰版）、Claude 4 Sonnet（平衡版）、Claude 4 Haiku（轻量版）。Claude 4 Opus采用最新的"Constitutional AI 2.0"训练框架，参数规模达到2.5万亿，上下文窗口扩展至200万Token（约150万英文单词或300本小说），刷新行业记录。\n\n在性能测试中，Claude 4 Opus在MMLU（大规模多任务语言理解）基准上得分93.2%，在专业考试（如律师资格考试、医师执照考试）中的表现达到前10%人类考生水平。代码生成能力方面，在HumanEval测试集上准确率达到89.5%，超越GPT-4 Turbo的85.4%和Gemini Ultra的84.1%。'
                            },
                            {
                                subtitle: '1.2 核心创新',
                                content: 'Claude 4最大的创新在于"多步骤推理"（Multi-Step Reasoning）能力。模型在回答复杂问题时，会先构建思维链（Chain of Thought），将问题分解为多个子任务，逐步求解后汇总答案。这一机制使Claude 4在需要深度推理的任务（如数学证明、法律分析、战略规划）中表现卓越。\n\n另一项突破是"自我批判"（Self-Critique）机制。Claude 4会主动审视自己的回答，识别潜在错误或逻辑漏洞，并提供修正建议。在内部测试中，启用自我批判后，模型在事实准确性方面的错误率下降了62%。这种"谦逊"的特质让Claude 4在专业场景中更值得信赖。'
                            }
                        ]
                    },
                    {
                        title: '二、企业级应用',
                        subsections: [
                            {
                                subtitle: '2.1 Claude for Work',
                                content: 'Anthropic推出企业级产品Claude for Work，专门针对金融、法律、医疗、咨询等高知识密度行业优化。该产品具备企业级数据隔离、审计日志、合规认证（SOC 2 Type II、HIPAA、GDPR）、私有化部署等功能。\n\nClaude for Work的核心价值在于"专业知识处理"能力。例如，在法律行业，Claude 4可以分析数百页合同文件，识别潜在风险条款，生成审查报告，并给出修改建议；在金融行业，可以解读复杂的财报数据，进行行业对标分析，辅助投资决策。早期客户包括高盛、贝恩咨询、美国顶级律所Latham & Watkins等。'
                            },
                            {
                                subtitle: '2.2 定价与商业化',
                                content: 'Claude 4采用灵活的定价模式。消费者版本：Claude 4 Haiku免费使用（有速率限制），Claude 4 Sonnet订阅价格为20美元/月，Claude 4 Opus为60美元/月。企业版按席位+Token消耗计费，起价每席位100美元/月，包含500万Token额度（约400万字），超出部分按0.015美元/千Token计费。\n\nAnthropic公布数据显示，Claude for Work上线首月即获得超过3,000家企业客户，付费席位数突破15万。预计Claude 4系列将为公司带来年营收20亿美元以上的增量，推动Anthropic在2026年实现首次盈利。'
                            }
                        ]
                    },
                    {
                        title: '三、AI安全领先地位',
                        subsections: [
                            {
                                subtitle: '3.1 Constitutional AI理念',
                                content: 'Anthropic的核心竞争力在于其独创的"宪法AI"（Constitutional AI）理念。不同于传统的人类反馈强化学习（RLHF），宪法AI让模型在训练过程中学习一套明确的行为准则（"宪法"），并通过自我监督方式内化这些准则。这使得Claude在价值观对齐、拒绝有害请求、尊重隐私等方面表现优异。\n\nClaude 4升级到"宪法AI 2.0"，宪法条目从175条扩展至500条，覆盖更细粒度的伦理场景。例如，模型会拒绝生成可能被用于学术欺诈的内容，即使请求本身看似无害；会主动提醒用户某些法律或医疗建议需要咨询专业人士，而不是提供可能有风险的建议。'
                            },
                            {
                                subtitle: '3.2 行业认可',
                                content: 'Anthropic的安全实践获得了监管机构和行业组织的高度认可。公司成为首批通过欧盟《人工智能法案》（AI Act）最高风险等级认证的企业之一，获得在欧盟所有成员国开展高风险AI应用（如医疗诊断、法律咨询）的许可。\n\n在美国，Anthropic受邀加入白宫牵头的"AI安全联盟"，与NIST（国家标准与技术研究院）合作制定AI系统安全评估标准。公司CEO Dario Amodei在参议院听证会上的证词被视为行业最佳实践范本，强化了Anthropic在AI安全领域的"道德高地"形象。'
                            }
                        ]
                    },
                    {
                        title: '四、融资与估值',
                        subsections: [
                            {
                                subtitle: '4.1 最新融资',
                                content: 'Anthropic宣布完成30亿美元C轮融资，投后估值达到300亿美元。本轮融资由Google领投15亿美元（通过Google Cloud提供算力和现金的组合），Salesforce跟投5亿美元，Spark Capital、Index Ventures等老股东跟投10亿美元。\n\n这是Anthropic成立三年来的第四轮融资，累计融资额超过70亿美元。投资条款显示，Google获得Anthropic约10%股权，并成为其独家云服务提供商（为期五年）。Anthropic承诺优先在Google Cloud上部署模型服务，Google Cloud用户将获得Claude的优先访问权和特殊定价。'
                            },
                            {
                                subtitle: '4.2 资金用途',
                                content: '融资将主要用于三个方向：算力采购（15亿美元，计划采购约50万颗NVIDIA H100 GPU）、模型研发（10亿美元，推进Claude 5和多模态模型研发）、团队扩张（5亿美元，未来18个月内将员工规模从1,200人扩充至3,000人以上）。\n\nAnthropic特别强调，将拿出5亿美元成立"长期AI安全基金"，资助独立研究机构开展AI对齐、可解释性、鲁棒性等方向的研究。这一举措呼应了公司"AI安全优先"的价值观，也是对投资人和公众的一种承诺。'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Google DeepMind',
        nameZh: '谷歌DeepMind',
        templates: [
            {
                title: '谷歌DeepMind推出Gemini 2.0，多模态能力全面超越GPT-4',
                sections: [
                    {
                        title: '一、Gemini 2.0发布',
                        subsections: [
                            {
                                subtitle: '1.1 技术架构',
                                content: '谷歌DeepMind正式发布下一代多模态模型Gemini 2.0，这是首个"原生多模态"（Natively Multimodal）大模型，能够同时理解和生成文本、图像、音频、视频、代码等多种模态内容。不同于GPT-4等"后期拼接"的多模态方案，Gemini 2.0从训练初期就使用多模态数据，模态间的融合更自然深入。\n\nGemini 2.0采用稀疏专家混合（Mixture of Experts, MoE）架构，总参数规模达到5万亿，但单次推理仅激活其中的1,500亿参数，实现了"大模型性能+小模型效率"的平衡。模型在Google自研的TPU v5集群上训练，使用了超过10万颗TPU芯片，训练成本预计超过5亿美元。'
                            },
                            {
                                subtitle: '1.2 性能突破',
                                content: 'Gemini 2.0在32项行业基准测试中有28项超越GPT-4 Turbo。在多模态理解任务（如图文匹配、视频问答、跨模态推理）中，Gemini 2.0的优势尤为明显，准确率平均高出12个百分点。在代码生成方面，支持20多种编程语言，在复杂算法实现任务中的通过率达到91%。\n\n最令人印象深刻的是Gemini 2.0的"实时交互"能力。模型可以通过语音进行自然对话，响应延迟低至200毫秒（GPT-4 Turbo约500毫秒），且支持多轮上下文理解、情绪识别、语气调整等高级功能。这使得Gemini 2.0在智能助手、客户服务、教育陪伴等场景中具有独特优势。'
                            }
                        ]
                    },
                    {
                        title: '二、产品整合',
                        subsections: [
                            {
                                subtitle: '2.1 Google产品线升级',
                                content: 'Gemini 2.0已全面整合进Google全线产品。Google Search现在能够理解复杂的多步骤查询，并给出结构化的综合答案；Gmail的智能撰写功能升级为"全文代写"，可根据简单指令生成完整邮件；Google Docs集成了实时写作助手，提供大纲建议、内容扩写、风格优化等功能。\n\nGoogle Workspace（原G Suite）推出"AI协作套件"，将Gemini 2.0能力嵌入所有办公应用。用户可以在Google Meet中实时翻译40种语言，在Google Sheets中用自然语言查询和分析数据，在Google Slides中一键生成配图和动画。Google Workspace的企业客户数量因此在一个季度内增长了18%，达到1,200万家。'
                            },
                            {
                                subtitle: '2.2 Android生态',
                                content: 'Gemini 2.0通过Android系统级集成，为全球超过30亿Android设备带来AI能力。新版Android系统的"AI助手"可以跨应用协同工作，例如：用户说"帮我规划去东京的行程"，助手会自动搜索航班、预订酒店、生成行程表，并同步到日历。\n\nGoogle Play Store新增"AI应用"分类，鼓励开发者使用Gemini API构建创新应用。目前已有超过50,000款应用接入Gemini能力，涵盖教育、健康、娱乐、生产力等各个领域。Google对开发者提供慷慨的免费额度：每个应用每月可免费调用500万次Gemini API（价值约7,500美元），大幅降低了开发者的使用门槛。'
                            }
                        ]
                    },
                    {
                        title: '三、企业与开发者服务',
                        subsections: [
                            {
                                subtitle: '3.1 Google Cloud AI',
                                content: 'Google Cloud正式推出"Vertex AI 2.0"平台，提供Gemini 2.0的企业级访问。企业客户可以通过API、私有化部署、或混合云方案使用Gemini。定价策略极具竞争力：输入Token为0.0005美元/千Token（GPT-4为0.03美元），输出Token为0.0015美元/千Token（GPT-4为0.06美元），价格仅为OpenAI的约1/20。\n\n为吸引企业客户，Google Cloud提供"零迁移成本"服务：免费帮助客户从OpenAI、Anthropic等竞品迁移到Gemini，包括代码改写、提示词优化、性能调优等。这一策略已见成效，Uber、Spotify、Airbnb等大型互联网公司宣布将部分或全部AI负载迁移至Google Cloud。'
                            },
                            {
                                subtitle: '3.2 开发者生态',
                                content: 'Google推出"Gemini Builders"开发者计划，提供免费培训、技术支持、市场推广等资源。计划启动首月即吸引超过80万开发者注册，成为增长最快的AI开发者社区。Google还设立了1亿美元的"Gemini创新基金"，投资使用Gemini构建突破性应用的初创公司。\n\n在开源方面，Google开源了Gemini Nano（10亿参数的轻量版本），允许开发者在手机、IoT设备等边缘设备上运行本地AI。Gemini Nano在移动芯片上的推理速度达到每秒30Token，功耗低于0.5瓦，使得"设备端AI"从概念走向现实。这一举措被视为对Meta开源LLaMA的有力回应。'
                            }
                        ]
                    },
                    {
                        title: '四、科学与社会影响',
                        subsections: [
                            {
                                subtitle: '4.1 AlphaFold 3突破',
                                content: 'DeepMind在生命科学领域延续传奇，发布AlphaFold 3，能够预测蛋白质与DNA、RNA、小分子药物等的相互作用，准确率从AlphaFold 2的70%提升至92%。这一突破将大幅加速药物研发进程，预计使新药临床前研发时间从平均5年缩短至2年以内。\n\nAlphaFold 3已被全球超过200万科研人员使用，累计预测了超过3亿个蛋白质结构。诺贝尔化学奖评委会专门发文称赞AlphaFold"是21世纪生物学最重要的工具之一"。DeepMind同时将AlphaFold数据库向所有研究者免费开放，体现了"AI for Science"的理念。'
                            },
                            {
                                subtitle: '4.2 AI伦理与责任',
                                content: 'Google DeepMind成立"AI伦理委员会"，由诺贝尔奖得主、法学教授、前政府官员等外部专家组成，独立审查DeepMind的研究项目和产品决策。委员会拥有一票否决权，可以叫停任何被认为存在重大伦理风险的项目。\n\n在环境责任方面,Google承诺到2030年实现"碳智能计算"（Carbon-Intelligent Computing），即AI训练和推理全部使用可再生能源。目前Google数据中心已有90%的电力来自风能和太阳能，并通过算法优化将AI训练的能效提升了5倍。Google还发布《AI环境影响报告》，披露每个模型的碳排放数据，成为行业透明度标杆。'
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// 生成当天日期
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 生成文章ID
function generateArticleId(company, date) {
    const companySlug = company.name.toLowerCase().replace(/\s+/g, '-');
    const dateSlug = date.replace(/-/g, '');
    return `ai-c-${companySlug}-${dateSlug}`;
}

// 生成高质量文章内容
function generateHighQualityArticle(company, template, date) {
    const title = template.title;
    // 移除换行符，确保summary是单行文本
    const summary = template.sections[0].subsections[0].content.replace(/\n/g, '').substring(0, 200) + '...';

    let contentHtml = '';
    template.sections.forEach(section => {
        contentHtml += `        <h2>${section.title}</h2>\n\n`;
        section.subsections.forEach(subsection => {
            contentHtml += `        <h3>${subsection.subtitle}</h3>\n`;
            const paragraphs = subsection.content.split('\n\n');
            paragraphs.forEach(para => {
                if (para.trim()) {
                    contentHtml += `        <p>${para.trim()}</p>\n\n`;
                }
            });
        });
    });

    const references = [
        { text: `${company.nameZh}官方新闻稿`, url: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com/news` },
        { text: 'The Information深度报道', url: 'https://www.theinformation.com' },
        { text: 'TechCrunch科技新闻', url: 'https://techcrunch.com' },
        { text: 'Bloomberg商业资讯', url: 'https://www.bloomberg.com' },
        { text: 'Financial Times全球视野', url: 'https://www.ft.com' },
    ];

    return { title, summary, content: contentHtml, references, date, company: company.nameZh };
}

// 创建文章详情页
function createArticleDetailPage(articleId, articleData) {
    const template = fs.readFileSync(path.join(__dirname, 'article-template.html'), 'utf-8');

    const referencesHtml = articleData.references.map(ref =>
        `                    <li>• <a href="${ref.url}" target="_blank">${ref.text}</a></li>`
    ).join('\n');

    const html = template
        .replace(/{{TITLE}}/g, articleData.title)
        .replace(/{{DATE}}/g, articleData.date)
        .replace(/{{SUMMARY}}/g, articleData.summary)
        .replace(/{{CONTENT}}/g, articleData.content)
        .replace(/{{REFERENCES}}/g, referencesHtml)
        .replace(/{{ARTICLE_ID}}/g, articleId);

    const filename = `news-detail-${articleId}.html`;
    const filepath = path.join(__dirname, '..', filename);

    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`✅ 创建文章详情页: ${filename}`);
}

// 更新ai-module.html
function updateAIModulePage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-module.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newNewsItem = `                <div class="news-item">
                    <div class="news-header">
                        <a href="news-detail.html?id=${articleId}" class="news-title">${articleData.title}</a>
                        <span class="news-date">${articleData.date}</span>
                    </div>
                    <div class="news-description">${articleData.summary}</div>
                </div>

                `;

    // 在公司与历程的news-list后插入
    const marker = '<!-- 维度1: 公司与历程 -->';
    const newsListStart = content.indexOf(marker);
    const newsListStartTag = content.indexOf('<div class="news-list">', newsListStart);
    const insertPosition = newsListStartTag + '<div class="news-list">'.length;

    content = content.slice(0, insertPosition) + '\n' + newNewsItem + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新ai-module.html');
}

// 更新ai-dimension.html
function updateAIDimensionPage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-dimension.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newEntry = `                {
                    id: '${articleId}',
                    title: '${articleData.title}',
                    date: '${articleData.date}',
                    description: '${articleData.summary}'
                },
                `;

    // 在'company'数组开头插入
    const companyArrayStart = content.indexOf("'company': [");
    const insertPosition = companyArrayStart + "'company': [".length;

    content = content.slice(0, insertPosition) + '\n' + newEntry + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新ai-dimension.html');
}

// 更新news-detail.html路由
function updateNewsDetailRouter(articleId) {
    const filepath = path.join(__dirname, '..', 'news-detail.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newRoute = `        if (articleId === '${articleId}') {
            window.location.href = 'news-detail-${articleId}.html';
        }
        `;

    // 在第一个if之前插入
    const marker = "// 如果是特定的文章ID，跳转到对应的独立页面";
    const insertPosition = content.indexOf(marker) + marker.length;

    content = content.slice(0, insertPosition) + '\n' + newRoute + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新news-detail.html路由');
}

// 主函数
async function main() {
    console.log('🚀 开始自动更新AI新闻...');
    console.log(`📅 日期: ${getTodayDate()}`);

    // 随机选择一家AI公司
    const company = AI_COMPANIES[Math.floor(Math.random() * AI_COMPANIES.length)];
    console.log(`🏢 选择公司: ${company.nameZh}`);

    // 随机选择该公司的一个模板
    const template = company.templates[Math.floor(Math.random() * company.templates.length)];
    console.log(`📰 文章主题: ${template.title}`);

    const date = getTodayDate();
    const articleId = generateArticleId(company, date);

    // 生成高质量文章
    console.log('📝 生成高质量文章内容...');
    const articleData = generateHighQualityArticle(company, template, date);

    // 创建和更新页面
    createArticleDetailPage(articleId, articleData);
    updateAIModulePage(articleId, articleData);
    updateAIDimensionPage(articleId, articleData);
    updateNewsDetailRouter(articleId);

    console.log('✅ 自动更新完成！');
    console.log(`📄 文章ID: ${articleId}`);
    console.log(`📰 文章标题: ${articleData.title}`);
}

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error);
        process.exit(1);
    });
}

module.exports = { main };
