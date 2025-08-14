import type { INodeProperties } from 'n8n-workflow';

export const hrmsOperations: INodeProperties[] = [

	// ========== EMPLOYEES OPERATIONS ==========
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Get All Employees', value: 'getAllEmployees', action: 'Get all employees' },
			{ name: 'Add Employee', value: 'addEmployee', action: 'Add a new employee' },
			{ name: 'Update Employee', value: 'updateEmployee', action: 'Update an existing employee' },
			{ name: 'Get Employee', value: 'getEmployee', action: 'Get employee details' },
		],
		default: 'addEmployee',
		displayOptions: {
			show: {
				resource: ['hrms'],
			},
		},
	},



	// ========== EMPLOYEE FIELDS ==========

	// GID field (for update employee operation)
	{
		displayName: 'GID',
		name: 'gid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['updateEmployee']
			},
		},
		description: 'The GID of the employee to update',
	},

	// GID field (for view employee operation)
	{
		displayName: 'GID',
		name: 'gid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['getEmployee']
			},
		},
		description: 'The GID of the employee to view',
	},

	// Employee Name (required for add employee)

	{
		displayName: 'Salutation',
		name: 'title',
		type: 'options',
		required: true,
		default: 'Mr.',
		options: [
			{ name: 'Dr.', value: 'Dr.' },
			{ name: 'M/s.', value: 'M/s.' },
			{ name: 'Mr.', value: 'Mr.' },
			{ name: 'Mrs.', value: 'Mrs.' },
			{ name: 'Ms.', value: 'Ms.' },
			{ name: 'Prof.', value: 'Prof.' },
		],
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			}
		},
		description: 'Salutation of the employee',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Full name of the employee',
	},

	// Branch (required for add employee)
	{
		displayName: 'Branch Name or ID',
		name: 'branch',
		type: 'options',
		required: true,
		default: '',
		typeOptions: {
			loadOptionsMethod: 'getBranches',
		},
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Date of Join (required for add employee)
	{
		displayName: 'Date of Join',
		name: 'dateOfJoin',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Date when the employee joined the company',
	},

	// Personal Mobile (required for add employee)
	{
		displayName: 'Personal Mobile',
		name: 'personalMobile',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Personal mobile number of the employee',
	},

	// Office Email (required for add employee)
	{
		displayName: 'Office Email',
		name: 'officeEmail',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Official email address of the employee',
	},

	// Employee Status (required for add employee)
	{
		displayName: 'Employee Status',
		name: 'employeeStatus',
		type: 'options',
		required: true,
		options: [
			{ name: 'Active', value: 1 },
			{ name: 'Resigned', value: 0 },
			{ name: 'Absconded', value: 2 },
			{ name: 'Terminated', value: 3 },
			{ name: 'Furloughed', value: 4 },
		],
		default: 1,
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Employment status of the employee',
	},

	// Date of Birth (required for add employee)
	{
		displayName: 'Date of Birth',
		name: 'dateOfBirth',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Date of birth of the employee',
	},

	// Gender (required for add employee)
	{
		displayName: 'Gender',
		name: 'gender',
		type: 'options',
		required: true,
		options: [
			{ name: 'Male', value: 'Male' },
			{ name: 'Female', value: 'Female' },
			{ name: 'Other', value: 'Other' },
		],
		default: 'Male',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Gender of the employee',
	},

	// Employee ID (required for add employee)
	{
		displayName: 'Employee ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee']
			},
		},
		description: 'Unique employee ID',
	},

	// Additional fields for adding employee
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['addEmployee'],
			},
		},
		options: [
			{
				displayName: 'Aadhar',
				name: 'aadhar',
				type: 'string',
				default: '',
				description: 'Aadhar number of the employee',
			},
			{
				displayName: 'Blood Group',
				name: 'bloodGroup',
				type: 'options',
				options: [
					{ name: 'A-', value: 'A-' },
					{ name: 'A+', value: 'A+' },
					{ name: 'AB-', value: 'AB-' },
					{ name: 'AB+', value: 'AB+' },
					{ name: 'B-', value: 'B-' },
					{ name: 'B+', value: 'B+' },
					{ name: 'O-', value: 'O-' },
					{ name: 'O+', value: 'O+' },
				],
				default: 'O+',
				description: 'Blood group of the employee',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department the employee belongs to',
			},
			{
				displayName: 'Designation',
				name: 'designation',
				type: 'string',
				default: '',
				description: 'Job title or designation',
			},
			{
				displayName: 'Emergency Contact',
				name: 'emergencyContact',
				type: 'string',
				default: '',
				description: 'Emergency contact number',
			},
			{
				displayName: 'Employee Account Name (Bank)',
				name: 'employeeAccountName',
				type: 'string',
				default: '',
				description: 'Bank account holder name',
			},
			{
				displayName: 'Employee Account Number (Bank)',
				name: 'employeeAccountNumber',
				type: 'string',
				default: '',
				description: 'Bank account number',
			},
			{
				displayName: 'Employee Account Type (Bank)',
				name: 'employeeAccountType',
				type: 'options',
				options: [
					{ name: 'Savings Account', value: 'Savings Account' },
					{ name: 'Current Account', value: 'Current Account' },
					{ name: 'Salary Account', value: 'Salary Account' },
				],
				default: 'Savings Account',
				description: 'Type of bank account',
			},
			{
				displayName: 'Employee Bank Branch (Bank)',
				name: 'employeeBankBranch',
				type: 'string',
				default: '',
				description: 'Bank branch name',
			},
			{
				displayName: 'Employee Bank Name (Bank)',
				name: 'employeeBankName',
				type: 'string',
				default: '',
				description: 'Name of the bank',
			},
			{
				displayName: 'Employee IFSC Code (Bank)',
				name: 'employeeIfscCode',
				type: 'string',
				default: '',
				description: 'Bank IFSC code',
			},
			{
				displayName: 'Employee State Insurance Number',
				name: 'esiNumber',
				type: 'string',
				default: '',
				description: 'Employee State Insurance number(ESI)',
			},
			{
				displayName: 'Employment Type',
				name: 'employmentType',
				type: 'options',
				options: [
					{ name: 'Apprentice', value: 'Apprentice' },
					{ name: 'Contractual', value: 'Contractual' },
					{ name: 'Full Time', value: 'Full Time' },
					{ name: 'Part Time', value: 'Part Time' },
				],
				default: 'Full Time',
				description: 'Type of employment',
			},
			{
				displayName: 'Father Name',
				name: 'fatherName',
				type: 'string',
				default: '',
				description: "Father's name",
			},

			{
				displayName: 'Marital Status',
				name: 'maritalStatus',
				type: 'options',
				options: [
					{ name: 'Single', value: 'single' },
					{ name: 'Married', value: 'married' },
					{ name: 'Divorced', value: 'divorced' },
					{ name: 'Widowed', value: 'widowed' },
				],
				default: 'single',
				description: 'Marital status of the employee',
			},
			{
				displayName: 'Office Mobile',
				name: 'officeMobile',
				type: 'string',
				default: '',
				description: 'Official mobile number',
			},
			{
				displayName: 'PAN',
				name: 'pan',
				type: 'string',
				default: '',
				description: 'PAN card number',
			},
			{
				displayName: 'Permanent Address',
				name: 'permanentAddress',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Address',
				default: {},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'addressLine1',
								type: 'string',
								default: '',
								description: 'First line of present address',
							},
							{
								displayName: 'Address Line 2',
								name: 'addressLine2',
								type: 'string',
								default: '',
								description: 'Second line of present address',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City of present address',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country of present address',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode of present address',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State of present address',
							},
						],
					},
				],
				description: 'Permanent address details',
			},
			{
				displayName: 'Personal Email',
				name: 'personalEmail',
				type: 'string',
				default: '',
				description: 'Personal email address',
			},
			{
				displayName: 'Present Address',
				name: 'presentAddress',
				type: 'fixedCollection',
				placeholder: 'Add Address',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'addressLine1',
								type: 'string',
								default: '',
								description: 'First line of present address',
							},
							{
								displayName: 'Address Line 2',
								name: 'addressLine2',
								type: 'string',
								default: '',
								description: 'Second line of present address',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City of present address',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country of present address',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode of present address',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State of present address',
							},
						],
					},
				],
				description: 'Present address details',
			},
			{
				displayName: 'Religion',
				name: 'religion',
				type: 'string',
				default: '',
				description: 'Religion of the employee',
			},
			{
				displayName: 'Reporting Name or ID',
				name: 'reportingTo',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getEmployee',
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Shift Timing',
				name: 'shift',
				type: 'string',
				default: '',
				placeholder: '09:00:00-18:00:00',
				description: 'Shift timing for the employee in format HH:MM:SS-HH:MM:SS',
			},
			{
				displayName: 'UAN Number',
				name: 'uanNumber',
				type: 'string',
				default: '',
				description: 'Universal Account Number for PF',
			},
		],
	},

	// Update fields for updating employee
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['updateEmployee'],
			},
		},
		options: [
			{
				displayName: 'Aadhar',
				name: 'aadhar',
				type: 'string',
				default: '',
				description: 'Aadhar number of the employee',
			},
			{
				displayName: 'Blood Group',
				name: 'bloodGroup',
				type: 'options',
				options: [
					{ name: 'A-', value: 'A-' },
					{ name: 'A+', value: 'A+' },
					{ name: 'AB-', value: 'AB-' },
					{ name: 'AB+', value: 'AB+' },
					{ name: 'B-', value: 'B-' },
					{ name: 'B+', value: 'B+' },
					{ name: 'O-', value: 'O-' },
					{ name: 'O+', value: 'O+' },
				],
				default: 'O+',
				description: 'Blood group of the employee',
			},
			{
				displayName: 'Branch Name or ID',
				name: 'branch',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getBranches',
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Date of Birth',
				name: 'dateOfBirth',
				type: 'dateTime',
				default: '',
				description: 'Date of birth of the employee',
			},
			{
				displayName: 'Date of Exit',
				name: 'dateOfExit',
				type: 'dateTime',
				default: '',
				description: 'Date when the employee left the company',
			},
			{
				displayName: 'Date of Join',
				name: 'dateOfJoin',
				type: 'dateTime',
				default: '',
				description: 'Date when the employee joined the company',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department the employee belongs to',
			},
			{
				displayName: 'Designation',
				name: 'designation',
				type: 'string',
				default: '',
				description: 'Job title or designation',
			},
			{
				displayName: 'Emergency Contact',
				name: 'emergencyContact',
				type: 'string',
				default: '',
				description: 'Emergency contact number',
			},
			{
				displayName: 'Employee Account Name (Bank)',
				name: 'employeeAccountName',
				type: 'string',
				default: '',
				description: 'Bank account holder name',
			},
			{
				displayName: 'Employee Account Number (Bank)',
				name: 'employeeAccountNumber',
				type: 'string',
				default: '',
				description: 'Bank account number',
			},
			{
				displayName: 'Employee Account Type (Bank)',
				name: 'employeeAccountType',
				type: 'options',
				options: [
					{ name: 'Current Account', value: 'Current Account' },
					{ name: 'Salary Account', value: 'Salary Account' },
					{ name: 'Savings Account', value: 'Savings Account' },
				],
				default: 'Current Account',
				description: 'Type of bank account',
			},
			{
				displayName: 'Employee Bank Branch (Bank)',
				name: 'employeeBankBranch',
				type: 'string',
				default: '',
				description: 'Bank branch name',
			},
			{
				displayName: 'Employee Bank Name (Bank)',
				name: 'employeeBankName',
				type: 'string',
				default: '',
				description: 'Name of the bank',
			},
			{
				displayName: 'Employee ID',
				name: 'employeeId',
				type: 'string',
				default: '',
				description: 'Unique employee ID',
			},
			{
				displayName: 'Employee IFSC Code (Bank)',
				name: 'employeeIfscCode',
				type: 'string',
				default: '',
				description: 'Bank IFSC code',
			},
			{
				displayName: 'Employee Status',
				name: 'employeeStatus',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Inactive', value: 'inactive' },
				],
				default: 'active',
				description: 'Employment status of the employee',
			},
			{
				displayName: 'Employment Type',
				name: 'employmentType',
				type: 'options',
				options: [
					{ name: 'Contract', value: 'contract' },
					{ name: 'Freelance', value: 'freelance' },
					{ name: 'Full Time', value: 'full_time' },
					{ name: 'Internship', value: 'internship' },
					{ name: 'Part Time', value: 'part_time' },
				],
				default: 'full_time',
				description: 'Type of employment',
			},
			{
				displayName: 'Exit Description',
				name: 'exitDescription',
				type: 'string',
				default: '',
				description: 'Description or reason for employee exit',
			},
			{
				displayName: 'Father Name',
				name: 'fatherName',
				type: 'string',
				default: '',
				description: "Father's name",
			},
			{
				displayName: 'Gender',
				name: 'gender',
				type: 'options',
				options: [
					{ name: 'Female', value: 'female' },
					{ name: 'Male', value: 'male' },
					{ name: 'Other', value: 'other' },
				],
				default: 'male',
				description: 'Gender of the employee',
			},
			{
				displayName: 'Marital Status',
				name: 'maritalStatus',
				type: 'options',
				options: [
					{ name: 'Divorced', value: 'divorced' },
					{ name: 'Married', value: 'married' },
					{ name: 'Single', value: 'single' },
					{ name: 'Widowed', value: 'widowed' },
				],
				default: 'single',
				description: 'Marital status of the employee',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the employee',
			},
			{
				displayName: 'Office Email',
				name: 'officeEmail',
				type: 'string',
				default: '',
				description: 'Official email address of the employee',
			},
			{
				displayName: 'Office Mobile',
				name: 'officeMobile',
				type: 'string',
				default: '',
				description: 'Official mobile number',
			},
			{
				displayName: 'PAN',
				name: 'pan',
				type: 'string',
				default: '',
				description: 'PAN card number',
			},
			{
				displayName: 'Permanent Address',
				name: 'permanentAddress',
				type: 'fixedCollection',
				placeholder: 'Add Address',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'addressLine1',
								type: 'string',
								default: '',
								description: 'First line of permanent address',
							},
							{
								displayName: 'Address Line 2',
								name: 'addressLine2',
								type: 'string',
								default: '',
								description: 'Second line of permanent address',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City of permanent address',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country of permanent address',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode of permanent address',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State of permanent address',
							},
						],
					},
				],
				description: 'Permanent address details',
			},
			{
				displayName: 'Personal Email',
				name: 'personalEmail',
				type: 'string',
				default: '',
				description: 'Personal email address',
			},
			{
				displayName: 'Personal Mobile',
				name: 'personalMobile',
				type: 'string',
				default: '',
				description: 'Personal mobile number of the employee',
			},
			{
				displayName: 'Present Address',
				name: 'presentAddress',
				type: 'fixedCollection',
				placeholder: 'Add Address',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Address Line 1',
								name: 'addressLine1',
								type: 'string',
								default: '',
								description: 'First line of present address',
							},
							{
								displayName: 'Address Line 2',
								name: 'addressLine2',
								type: 'string',
								default: '',
								description: 'Second line of present address',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								description: 'City of present address',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								description: 'Country of present address',
							},
							{
								displayName: 'Pincode',
								name: 'pincode',
								type: 'string',
								default: '',
								description: 'Pincode of present address',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								description: 'State of present address',
							},
						],
					},
				],
				description: 'Present address details',
			},
			{
				displayName: 'Religion',
				name: 'religion',
				type: 'string',
				default: '',
				description: 'Religion of the employee',
			},
			{
				displayName: 'Reporting Name or ID',
				name: 'reportingTo',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getEmployee',
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Shift Timing',
				name: 'shift',
				type: 'string',
				default: '',
				placeholder: '09:00:00-18:00:00',
				description: 'Shift timing for the employee in format HH:MM:SS-HH:MM:SS',
			},
			{
				displayName: 'UAN Number',
				name: 'uanNumber',
				type: 'string',
				default: '',
				description: 'Universal Account Number for PF',
			},
		],
	},

	// Page size for list employees
	{
		displayName: 'Limit',
		name: 'perpage',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['getAllEmployees'],
			},
		},
		description: 'Number of employees to return',
	},

	// List employees filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['hrms'],
				operation: ['getAllEmployees'],
			},
		},
		options: [
			{
				displayName: 'Attendance Status',
				name: 'attendance_status',
				type: 'options',
				options: [
					{ name: 'Present', value: 1 },
					{ name: 'Absent', value: 0 },
				],
				default: 0,
				description: 'Attendance status of the employee',
			},
			{
				displayName: 'Search Term',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Search by employee name',
			},
			{
				displayName: 'Sort By',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'ASC' },
					{ name: 'Descending', value: 'DESC' },
				],
				default: 'DESC',
			},
			{
				displayName: 'Sort By Field',
				name: 'sortField',
				type: 'options',
				options: [
					{ name: 'Name', value: 'employee_name' },
					{ name: 'ID', value: 'employee_id' },
				],
				default: 'employee_name',
				description: 'Field to sort by',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 1 },
					{ name: 'Inactive', value: 0 },
				],
				default: 1,
				description: 'Status of the employee',
			},
		],
	},
];
