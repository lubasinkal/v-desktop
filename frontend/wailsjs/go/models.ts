export namespace models {
	
	export class AnnuityRequest {
	    tableName: string;
	    type: string;
	    age: number;
	    term: number;
	    deferment: number;
	    amount: number;
	    rate: number;
	
	    static createFrom(source: any = {}) {
	        return new AnnuityRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tableName = source["tableName"];
	        this.type = source["type"];
	        this.age = source["age"];
	        this.term = source["term"];
	        this.deferment = source["deferment"];
	        this.amount = source["amount"];
	        this.rate = source["rate"];
	    }
	}
	export class AnnuityResponse {
	    presentValue: number;
	
	    static createFrom(source: any = {}) {
	        return new AnnuityResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.presentValue = source["presentValue"];
	    }
	}
	export class CensusRecordResult {
	    sex: string;
	    policyType: string;
	    age: number;
	    sumAssured: number;
	    term: number;
	    presentValue: number;
	
	    static createFrom(source: any = {}) {
	        return new CensusRecordResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sex = source["sex"];
	        this.policyType = source["policyType"];
	        this.age = source["age"];
	        this.sumAssured = source["sumAssured"];
	        this.term = source["term"];
	        this.presentValue = source["presentValue"];
	    }
	}
	export class CensusRequest {
	    filePath: string;
	    interestRate: number;
	    rateJ: number;
	    limit: number;
	    workers: number;
	
	    static createFrom(source: any = {}) {
	        return new CensusRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filePath = source["filePath"];
	        this.interestRate = source["interestRate"];
	        this.rateJ = source["rateJ"];
	        this.limit = source["limit"];
	        this.workers = source["workers"];
	    }
	}
	export class CensusResponse {
	    records: CensusRecordResult[];
	    totalPV: number;
	    recordCount: number;
	    processingMs: number;
	
	    static createFrom(source: any = {}) {
	        return new CensusResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.records = this.convertValues(source["records"], CensusRecordResult);
	        this.totalPV = source["totalPV"];
	        this.recordCount = source["recordCount"];
	        this.processingMs = source["processingMs"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MonteCarloRequest {
	    model: string;
	    initialRate: number;
	    drift: number;
	    volatility: number;
	    longTermMean: number;
	    meanReversion: number;
	    numPaths: number;
	    steps: number;
	    dt: number;
	    seed: number;
	
	    static createFrom(source: any = {}) {
	        return new MonteCarloRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.model = source["model"];
	        this.initialRate = source["initialRate"];
	        this.drift = source["drift"];
	        this.volatility = source["volatility"];
	        this.longTermMean = source["longTermMean"];
	        this.meanReversion = source["meanReversion"];
	        this.numPaths = source["numPaths"];
	        this.steps = source["steps"];
	        this.dt = source["dt"];
	        this.seed = source["seed"];
	    }
	}
	export class PathPoint {
	    step: number;
	    values: number[];
	
	    static createFrom(source: any = {}) {
	        return new PathPoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.step = source["step"];
	        this.values = source["values"];
	    }
	}
	export class MonteCarloResponse {
	    paths: PathPoint[];
	    finalValues: number[];
	    samplePathsCount: number;
	
	    static createFrom(source: any = {}) {
	        return new MonteCarloResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.paths = this.convertValues(source["paths"], PathPoint);
	        this.finalValues = source["finalValues"];
	        this.samplePathsCount = source["samplePathsCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PVRecord {
	    sumAssured: number;
	    term: number;
	    age?: number;
	
	    static createFrom(source: any = {}) {
	        return new PVRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sumAssured = source["sumAssured"];
	        this.term = source["term"];
	        this.age = source["age"];
	    }
	}
	export class PVRequest {
	    interestRate: number;
	    rateJ?: number;
	    records: PVRecord[];
	
	    static createFrom(source: any = {}) {
	        return new PVRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.interestRate = source["interestRate"];
	        this.rateJ = source["rateJ"];
	        this.records = this.convertValues(source["records"], PVRecord);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PVResult {
	    index: number;
	    sumAssured: number;
	    term: number;
	    presentValue: number;
	
	    static createFrom(source: any = {}) {
	        return new PVResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.index = source["index"];
	        this.sumAssured = source["sumAssured"];
	        this.term = source["term"];
	        this.presentValue = source["presentValue"];
	    }
	}
	export class PVResponse {
	    results: PVResult[];
	
	    static createFrom(source: any = {}) {
	        return new PVResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.results = this.convertValues(source["results"], PVResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class ProfitRequest {
	    tableName: string;
	    age: number;
	    term: number;
	    sumAssured: number;
	    premium: number;
	    earnedRate: number;
	    discountRate: number;
	    acquisitionExp: number;
	    renewalExp: number;
	    commissionRate: number;
	    commissionYears: number;
	    reserveEnabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ProfitRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tableName = source["tableName"];
	        this.age = source["age"];
	        this.term = source["term"];
	        this.sumAssured = source["sumAssured"];
	        this.premium = source["premium"];
	        this.earnedRate = source["earnedRate"];
	        this.discountRate = source["discountRate"];
	        this.acquisitionExp = source["acquisitionExp"];
	        this.renewalExp = source["renewalExp"];
	        this.commissionRate = source["commissionRate"];
	        this.commissionYears = source["commissionYears"];
	        this.reserveEnabled = source["reserveEnabled"];
	    }
	}
	export class ProfitResponse {
	    profitSignature: number[];
	    cumulativeProfit: number[];
	    pvOfProfits: number;
	    pvOfPremiums: number;
	    profitMargin: number;
	    irr: number;
	    paybackYear: number;
	
	    static createFrom(source: any = {}) {
	        return new ProfitResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.profitSignature = source["profitSignature"];
	        this.cumulativeProfit = source["cumulativeProfit"];
	        this.pvOfProfits = source["pvOfProfits"];
	        this.pvOfPremiums = source["pvOfPremiums"];
	        this.profitMargin = source["profitMargin"];
	        this.irr = source["irr"];
	        this.paybackYear = source["paybackYear"];
	    }
	}
	export class RateConvertRequest {
	    fromValue: number;
	    fromType: string;
	    compounding: number;
	
	    static createFrom(source: any = {}) {
	        return new RateConvertRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fromValue = source["fromValue"];
	        this.fromType = source["fromType"];
	        this.compounding = source["compounding"];
	    }
	}
	export class RateConvertResponse {
	    effectiveRate: number;
	    nominalRate: number;
	    forceOfInterest: number;
	
	    static createFrom(source: any = {}) {
	        return new RateConvertResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.effectiveRate = source["effectiveRate"];
	        this.nominalRate = source["nominalRate"];
	        this.forceOfInterest = source["forceOfInterest"];
	    }
	}
	export class ReserveRequest {
	    age: number;
	    term: number;
	    sumAssured: number;
	    premium: number;
	    expenses: number;
	    rate: number;
	    tableName: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new ReserveRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.age = source["age"];
	        this.term = source["term"];
	        this.sumAssured = source["sumAssured"];
	        this.premium = source["premium"];
	        this.expenses = source["expenses"];
	        this.rate = source["rate"];
	        this.tableName = source["tableName"];
	        this.type = source["type"];
	    }
	}
	export class ReserveResponse {
	    value: number;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new ReserveResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.value = source["value"];
	        this.type = source["type"];
	    }
	}
	export class RiskResponse {
	    mean: number;
	    stdDev: number;
	    min: number;
	    max: number;
	    var95: number;
	    var99: number;
	    cte95: number;
	    cte99: number;
	    stdError: number;
	    confidence95Lo: number;
	    confidence95Hi: number;
	
	    static createFrom(source: any = {}) {
	        return new RiskResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mean = source["mean"];
	        this.stdDev = source["stdDev"];
	        this.min = source["min"];
	        this.max = source["max"];
	        this.var95 = source["var95"];
	        this.var99 = source["var99"];
	        this.cte95 = source["cte95"];
	        this.cte99 = source["cte99"];
	        this.stdError = source["stdError"];
	        this.confidence95Lo = source["confidence95Lo"];
	        this.confidence95Hi = source["confidence95Hi"];
	    }
	}
	export class TableDataRequest {
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new TableDataRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	    }
	}
	export class TableDataResponse {
	    name: string;
	    ages: number[];
	    qx: number[];
	    lx: number[];
	    ex: number[];
	    maxAge: number;
	
	    static createFrom(source: any = {}) {
	        return new TableDataResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.ages = source["ages"];
	        this.qx = source["qx"];
	        this.lx = source["lx"];
	        this.ex = source["ex"];
	        this.maxAge = source["maxAge"];
	    }
	}

}

